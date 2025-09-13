import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTenantSchema, type InsertTenant, type Property, type Tenant } from "@shared/schema";
import { z } from "zod";

// Create client-side schema that omits userId and handles date strings
const clientTenantSchema = insertTenantSchema.omit({ userId: true }).extend({
  leaseStart: z.string(), // HTML date inputs return strings
  leaseEnd: z.string()
});
type TenantFormValues = z.infer<typeof clientTenantSchema>;

interface TenantFormProps {
  tenant?: Tenant;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TenantForm({ tenant, onSuccess, onCancel }: TenantFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(clientTenantSchema),
    defaultValues: tenant ? {
      name: tenant.name,
      email: tenant.email,
      propertyId: tenant.propertyId,
      rentAmount: tenant.rentAmount,
      paymentStatus: tenant.paymentStatus,
      leaseStart: new Date(tenant.leaseStart).toISOString().split('T')[0],
      leaseEnd: new Date(tenant.leaseEnd).toISOString().split('T')[0],
    } : {
      name: "",
      email: "",
      propertyId: "",
      rentAmount: "",
      paymentStatus: "pending",
      leaseStart: "",
      leaseEnd: "",
    },
  });

  const createTenantMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/tenants", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({
        title: "Tenant created",
        description: "The tenant has been added successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to create tenant",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/tenants/${tenant?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({
        title: "Tenant updated",
        description: "The tenant has been updated successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to update tenant",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TenantFormValues) => {
    // Convert date strings to Date objects for API
    const apiData = {
      ...data,
      leaseStart: new Date(data.leaseStart),
      leaseEnd: new Date(data.leaseEnd),
    };

    if (tenant) {
      updateTenantMutation.mutate(apiData);
    } else {
      createTenantMutation.mutate(apiData);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Tenant Name</Label>
          <Input
            id="name"
            placeholder="Enter tenant name"
            data-testid="input-tenant-name"
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email"
            data-testid="input-tenant-email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="propertyId">Property</Label>
        <Select 
          value={form.watch("propertyId")} 
          onValueChange={(value) => form.setValue("propertyId", value)}
        >
          <SelectTrigger data-testid="select-property">
            <SelectValue placeholder="Select a property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name} - {property.address}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rentAmount">Rent Amount (TND)</Label>
          <Input
            id="rentAmount"
            type="number"
            step="0.01"
            placeholder="Enter rent amount"
            data-testid="input-rent-amount"
            {...form.register("rentAmount")}
          />
          {form.formState.errors.rentAmount && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.rentAmount.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="paymentStatus">Payment Status</Label>
          <Select 
            value={form.watch("paymentStatus")} 
            onValueChange={(value) => form.setValue("paymentStatus", value)}
          >
            <SelectTrigger data-testid="select-payment-status">
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="leaseStart">Lease Start Date</Label>
          <Input
            id="leaseStart"
            type="date"
            data-testid="input-lease-start"
            {...form.register("leaseStart")}
          />
          {form.formState.errors.leaseStart && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.leaseStart.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="leaseEnd">Lease End Date</Label>
          <Input
            id="leaseEnd"
            type="date"
            data-testid="input-lease-end"
            {...form.register("leaseEnd")}
          />
          {form.formState.errors.leaseEnd && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.leaseEnd.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createTenantMutation.isPending || updateTenantMutation.isPending}
          data-testid="button-save-tenant"
        >
          {createTenantMutation.isPending || updateTenantMutation.isPending
            ? "Saving..."
            : tenant
            ? "Update Tenant"
            : "Add Tenant"}
        </Button>
      </div>
    </form>
  );
}
