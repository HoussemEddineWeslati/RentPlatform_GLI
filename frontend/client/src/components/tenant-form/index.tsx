import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { insertTenantSchema, Tenant } from "@/types/schema";

interface TenantFormProps {
  tenant?: Tenant | null;
  propertyId: string; // This is now a required prop
  onSuccess: () => void;
  onCancel: () => void;
}

const tenantFormSchema = insertTenantSchema.omit({
  id: true,
  propertyId: true,
  createdAt: true,
  updatedAt: true,
});

type TenantFormData = z.infer<typeof tenantFormSchema>;

export function TenantForm({ tenant, propertyId, onSuccess, onCancel }: TenantFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TenantFormData>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: tenant?.name || "",
      email: tenant?.email || "",
      rentAmount: tenant?.rentAmount || 0,
      paymentStatus: tenant?.paymentStatus || "pending",
      leaseStart: tenant?.leaseStart ? tenant.leaseStart.substring(0, 16) : "",
      leaseEnd: tenant?.leaseEnd ? tenant.leaseEnd.substring(0, 16) : "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: TenantFormData) => {
      // Add the required propertyId to the payload
      const payload = { 
        ...data, 
        propertyId,
        // Ensure dates are in full ISO format for the backend
        leaseStart: new Date(data.leaseStart).toISOString(),
        leaseEnd: new Date(data.leaseEnd).toISOString(),
      };
      return tenant
        ? apiRequest("PATCH", `/api/tenants/${tenant.id}`, payload)
        : apiRequest("POST", "/api/tenants", payload);
    },
    onSuccess: () => {
      // Invalidate the query for this specific property's tenants
      queryClient.invalidateQueries({ queryKey: ["/api/properties", propertyId, "tenants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties", propertyId] }); // to update count
      toast({
        title: tenant ? "Tenant Updated" : "Tenant Created",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: `Failed to ${tenant ? "update" : "create"} tenant`,
        description: error?.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TenantFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
      </div>
       <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...form.register("email")} />
        {form.formState.errors.email && <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>}
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rentAmount">Rent Amount (TND)</Label>
          <Input id="rentAmount" type="number" {...form.register("rentAmount")} />
          {form.formState.errors.rentAmount && <p className="text-sm text-destructive mt-1">{form.formState.errors.rentAmount.message}</p>}
        </div>
        <div>
          <Label htmlFor="paymentStatus">Payment Status</Label>
          <Select onValueChange={(v) => form.setValue("paymentStatus", v as any)} defaultValue={form.getValues("paymentStatus")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="leaseStart">Lease Start</Label>
          <Input id="leaseStart" type="datetime-local" {...form.register("leaseStart")} />
          {form.formState.errors.leaseStart && <p className="text-sm text-destructive mt-1">{form.formState.errors.leaseStart.message}</p>}
        </div>
        <div>
          <Label htmlFor="leaseEnd">Lease End</Label>
          <Input id="leaseEnd" type="datetime-local" {...form.register("leaseEnd")} />
          {form.formState.errors.leaseEnd && <p className="text-sm text-destructive mt-1">{form.formState.errors.leaseEnd.message}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : tenant ? "Update Tenant" : "Add Tenant"}
        </Button>
      </div>
    </form>
  );
}