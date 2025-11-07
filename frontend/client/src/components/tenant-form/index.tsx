// src/components/tenant-form.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { insertTenantSchema, type Tenant, type Property } from "@/types/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type TenantFormProps = {
  tenant?: Tenant | null;
  propertyId?: string;
  landlordId?: string; // New prop to enable property selection
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function TenantForm({ tenant, propertyId, landlordId, onSuccess, onCancel }: TenantFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch properties if landlordId is provided
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/landlords", landlordId, "properties"],
    enabled: !!landlordId && !propertyId,
  });

  const form = useForm({
    resolver: zodResolver(insertTenantSchema),
    defaultValues: {
      name: tenant?.name || "",
      email: tenant?.email || "",
      rentAmount: tenant?.rentAmount || 0,
      paymentStatus: tenant?.paymentStatus || "pending",
      leaseStart: tenant?.leaseStart 
        ? new Date(tenant.leaseStart).toISOString().split("T")[0]
        : "",
      leaseEnd: tenant?.leaseEnd
        ? new Date(tenant.leaseEnd).toISOString().split("T")[0]
        : "",
      propertyId: tenant?.propertyId || propertyId || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      tenant
        ? apiRequest("PATCH", `/api/tenants/${tenant.id}`, data)
        : apiRequest("POST", "/api/tenants", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      if (landlordId) {
        queryClient.invalidateQueries({ queryKey: ["/api/landlords", landlordId, "tenants"] });
      }
      if (propertyId || form.getValues("propertyId")) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/properties", propertyId || form.getValues("propertyId"), "tenants"] 
        });
      }
      toast({
        title: tenant ? "Tenant Updated" : "Tenant Created",
        description: tenant
          ? "The tenant has been updated successfully."
          : "A new tenant has been created successfully.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Operation Failed",
        description: error?.message || "Could not save the tenant.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Convert date strings (YYYY-MM-DD) to ISO datetime format for the backend
    const submitData = {
      ...data,
      leaseStart: `${data.leaseStart}T00:00:00.000Z`,
      leaseEnd: `${data.leaseEnd}T00:00:00.000Z`,
    };
    mutation.mutate(submitData);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Property Selection - Only show if landlordId provided and no fixed propertyId */}
        {landlordId && !propertyId && (
          <div className="md:col-span-2">
            <Label htmlFor="propertyId">Property *</Label>
            <Select
              onValueChange={(value) => form.setValue("propertyId", value)}
              defaultValue={form.getValues("propertyId")}
              disabled={!!tenant}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p: Property) => (
                  <SelectItem key={p.id} value={p.id!}>
                    {p.name} - {p.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.propertyId && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.propertyId.message}
              </p>
            )}
          </div>
        )}

        {/* Name */}
        <div>
          <Label htmlFor="name">Tenant Name *</Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="e.g., Yasmine Bouazizi"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            placeholder="tenant@example.com"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Rent Amount */}
        <div>
          <Label htmlFor="rentAmount">Rent Amount (TND) *</Label>
          <Input
            id="rentAmount"
            type="number"
            step="0.01"
            {...form.register("rentAmount", { valueAsNumber: true })}
            placeholder="1500"
          />
          {form.formState.errors.rentAmount && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.rentAmount.message}
            </p>
          )}
        </div>

        {/* Payment Status */}
        <div>
          <Label htmlFor="paymentStatus">Payment Status *</Label>
          <Select
            onValueChange={(value) =>
              form.setValue("paymentStatus", value as any)
            }
            defaultValue={form.getValues("paymentStatus")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.paymentStatus && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.paymentStatus.message}
            </p>
          )}
        </div>

        {/* Lease Start Date - DATE ONLY */}
        <div>
          <Label htmlFor="leaseStart">Lease Start Date *</Label>
          <Input
            id="leaseStart"
            type="date"
            {...form.register("leaseStart")}
          />
          {form.formState.errors.leaseStart && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.leaseStart.message}
            </p>
          )}
        </div>

        {/* Lease End Date - DATE ONLY */}
        <div>
          <Label htmlFor="leaseEnd">Lease End Date *</Label>
          <Input
            id="leaseEnd"
            type="date"
            {...form.register("leaseEnd")}
          />
          {form.formState.errors.leaseEnd && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.leaseEnd.message}
            </p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Saving..."
            : tenant
            ? "Update Tenant"
            : "Create Tenant"}
        </Button>
      </div>
    </form>
  );
}