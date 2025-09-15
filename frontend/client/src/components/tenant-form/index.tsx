// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import { apiRequest } from "@/lib/queryClient";
// import { insertTenantSchema, type InsertTenant } from "../../types/schema";
// import { z } from "zod";

// interface Tenant {
//   id: string;
//   name: string;
//   email: string;
//   rentAmount: string;
//   paymentStatus: string;
//   propertyId: string;
//   userId: string;
// }

// interface Property {
//   id: string;
//   name: string;
//   address: string;
//   type: string;
//   rentAmount: string;
//   userId: string;
// }

// interface TenantFormProps {
//   tenant?: Tenant | null;
//   onSuccess: () => void;
//   onCancel: () => void;
// }

// const tenantFormSchema = insertTenantSchema.extend({
//   rentAmount: z.string().min(1, "Rent amount is required"),
// });

// type TenantFormData = z.infer<typeof tenantFormSchema>;

// export function TenantForm({ tenant, onSuccess, onCancel }: TenantFormProps) {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const { data: properties = [] } = useQuery<Property[]>({
//     queryKey: ["/api/properties"],
//   });

//   const form = useForm<TenantFormData>({
//     resolver: zodResolver(tenantFormSchema),
//     defaultValues: {
//       name: tenant?.name || "",
//       email: tenant?.email || "",
//       rentAmount: tenant?.rentAmount || "",
//       paymentStatus: tenant?.paymentStatus || "pending",
//       propertyId: tenant?.propertyId || "",
//     },
//   });

//   const createTenantMutation = useMutation({
//     mutationFn: (data: TenantFormData) => apiRequest("POST", "/api/tenants", data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
//       toast({
//         title: "Tenant created",
//         description: "The tenant has been added successfully.",
//       });
//       onSuccess();
//     },
//     onError: (error) => {
//       toast({
//         title: "Failed to create tenant",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const updateTenantMutation = useMutation({
//     mutationFn: (data: TenantFormData) => 
//       apiRequest("PATCH", `/api/tenants/${tenant?.id}`, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
//       toast({
//         title: "Tenant updated",
//         description: "The tenant has been updated successfully.",
//       });
//       onSuccess();
//     },
//     onError: (error) => {
//       toast({
//         title: "Failed to update tenant",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const onSubmit = (data: TenantFormData) => {
//     if (tenant) {
//       updateTenantMutation.mutate(data);
//     } else {
//       createTenantMutation.mutate(data);
//     }
//   };

//   return (
//     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//       <div>
//         <Label htmlFor="name">Full Name</Label>
//         <Input
//           id="name"
//           placeholder="Enter tenant's full name"
//           data-testid="input-tenant-name"
//           {...form.register("name")}
//         />
//         {form.formState.errors.name && (
//           <p className="text-sm text-destructive mt-1">
//             {form.formState.errors.name.message}
//           </p>
//         )}
//       </div>

//       <div>
//         <Label htmlFor="email">Email Address</Label>
//         <Input
//           id="email"
//           type="email"
//           placeholder="Enter tenant's email"
//           data-testid="input-tenant-email"
//           {...form.register("email")}
//         />
//         {form.formState.errors.email && (
//           <p className="text-sm text-destructive mt-1">
//             {form.formState.errors.email.message}
//           </p>
//         )}
//       </div>

//       <div>
//         <Label htmlFor="propertyId">Property</Label>
//         <Select
//           onValueChange={(value) => form.setValue("propertyId", value)}
//           defaultValue={form.getValues("propertyId")}
//         >
//           <SelectTrigger data-testid="select-property">
//             <SelectValue placeholder="Select a property" />
//           </SelectTrigger>
//           <SelectContent>
//             {properties.map((property) => (
//               <SelectItem key={property.id} value={property.id}>
//                 {property.name} - {property.address}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         {form.formState.errors.propertyId && (
//           <p className="text-sm text-destructive mt-1">
//             {form.formState.errors.propertyId.message}
//           </p>
//         )}
//       </div>

//       <div>
//         <Label htmlFor="rentAmount">Monthly Rent (TND)</Label>
//         <Input
//           id="rentAmount"
//           type="number"
//           placeholder="Enter monthly rent amount"
//           data-testid="input-tenant-rent"
//           {...form.register("rentAmount")}
//         />
//         {form.formState.errors.rentAmount && (
//           <p className="text-sm text-destructive mt-1">
//             {form.formState.errors.rentAmount.message}
//           </p>
//         )}
//       </div>

//       <div>
//         <Label htmlFor="paymentStatus">Payment Status</Label>
//         <Select
//           onValueChange={(value) => form.setValue("paymentStatus", value)}
//           defaultValue={form.getValues("paymentStatus")}
//         >
//           <SelectTrigger data-testid="select-payment-status">
//             <SelectValue placeholder="Select payment status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="paid">Paid</SelectItem>
//             <SelectItem value="pending">Pending</SelectItem>
//             <SelectItem value="overdue">Overdue</SelectItem>
//           </SelectContent>
//         </Select>
//         {form.formState.errors.paymentStatus && (
//           <p className="text-sm text-destructive mt-1">
//             {form.formState.errors.paymentStatus.message}
//           </p>
//         )}
//       </div>

//       <div className="flex justify-end space-x-3">
//         <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
//           Cancel
//         </Button>
//         <Button 
//           type="submit" 
//           disabled={createTenantMutation.isPending || updateTenantMutation.isPending}
//           data-testid="button-save-tenant"
//         >
//           {createTenantMutation.isPending || updateTenantMutation.isPending
//             ? "Saving..." 
//             : tenant ? "Update Tenant" : "Add Tenant"}
//         </Button>
//       </div>
//     </form>
//   );
// }
// client/src/components/tenant-form/index.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { apiRequest } from "@/lib/api";
import { insertTenantSchema } from "@/types/schema";
import { z } from "zod";

interface Tenant {
  id: string;
  name: string;
  email: string;
  rentAmount: string;
  paymentStatus: string;
  propertyId: string;
  userId: string;
}

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  rentAmount?: string;
  userId: string;
}

interface TenantFormProps {
  tenant?: Tenant | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const tenantFormSchema = insertTenantSchema.extend({
  rentAmount: z.string().min(1, "Rent amount is required"),
});

type TenantFormData = z.infer<typeof tenantFormSchema>;

export function TenantForm({ tenant, onSuccess, onCancel }: TenantFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const form = useForm<TenantFormData>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: tenant?.name || "",
      email: tenant?.email || "",
      rentAmount: tenant?.rentAmount || "",
      paymentStatus: tenant?.paymentStatus || "pending",
      propertyId: tenant?.propertyId || "",
    },
  });

  const createTenantMutation = useMutation({
    mutationFn: (data: TenantFormData) =>
      apiRequest("POST", "/api/tenants", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({
        title: "Tenant created",
        description: "The tenant has been added successfully.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create tenant",
        description: error?.message ?? String(error),
        variant: "destructive",
      });
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: (data: TenantFormData) =>
      apiRequest("PATCH", `/api/tenants/${tenant?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({
        title: "Tenant updated",
        description: "The tenant has been updated successfully.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update tenant",
        description: error?.message ?? String(error),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TenantFormData) => {
    if (tenant) updateTenantMutation.mutate(data);
    else createTenantMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Enter tenant's full name"
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
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter tenant's email"
          data-testid="input-tenant-email"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="propertyId">Property</Label>
        <Select
          onValueChange={(v) => form.setValue("propertyId", v)}
          defaultValue={form.getValues("propertyId")}
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

      <div>
        <Label htmlFor="rentAmount">Monthly Rent (TND)</Label>
        <Input
          id="rentAmount"
          type="number"
          placeholder="Enter monthly rent amount"
          data-testid="input-tenant-rent"
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
          onValueChange={(v) => form.setValue("paymentStatus", v)}
          defaultValue={form.getValues("paymentStatus")}
        >
          <SelectTrigger data-testid="select-payment-status">
            <SelectValue placeholder="Select payment status" />
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

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="button-cancel"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            createTenantMutation.isPending || updateTenantMutation.isPending
          }
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
