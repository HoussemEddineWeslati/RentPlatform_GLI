// src/components/property-form/index.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea"; // For description
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { insertPropertySchema, Property } from "@/types/schema";

interface PropertyFormProps {
  property?: Property | null;
  landlordId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const propertyFormSchema = insertPropertySchema.omit({
  id: true,
  landlordId: true,
  createdAt: true,
  updatedAt: true,
  assignedTenants: true
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

export function PropertyForm({
  property,
  landlordId,
  onSuccess,
  onCancel,
}: PropertyFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: property?.name || "",
      address: property?.address || "",
      city: property?.city || "",
      rentAmount: property?.rentAmount || 0,
      type: property?.type || "apartment",
      status: property?.status || "available",
      maxTenants: property?.maxTenants || 1,
      description: property?.description || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PropertyFormData) => {
      const payload = { ...data, landlordId };
      return property
        ? apiRequest("PATCH", `/api/properties/${property.id}`, payload)
        : apiRequest("POST", "/api/properties", payload);
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/landlords", landlordId, "properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/landlords", landlordId] }); // To update property count
      toast({
        title: property ? "Property Updated" : "Property Created",
        description: `The property has been successfully ${property ? "updated" : "created"}.`,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: `Failed to ${property ? "update" : "create"} property`,
        description: error?.message ?? String(error),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PropertyFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Form Fields: Name, Address, City */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div>
            <Label htmlFor="name">Property Name</Label>
            <Input id="name" placeholder="e.g., Villa Sunshine" {...form.register("name")} />
            {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
        </div>
         <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="e.g., 123 Main St" {...form.register("address")} />
            {form.formState.errors.address && <p className="text-sm text-destructive mt-1">{form.formState.errors.address.message}</p>}
        </div>
      </div>
      
       <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="e.g., Tunis" {...form.register("city")} />
            {form.formState.errors.city && <p className="text-sm text-destructive mt-1">{form.formState.errors.city.message}</p>}
      </div>

      {/* Form Fields: Rent, Max Tenants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <Label htmlFor="rentAmount">Rent Amount (TND)</Label>
            <Input id="rentAmount" type="number" {...form.register("rentAmount")} />
            {form.formState.errors.rentAmount && <p className="text-sm text-destructive mt-1">{form.formState.errors.rentAmount.message}</p>}
        </div>
        <div>
            <Label htmlFor="maxTenants">Max Tenants</Label>
            <Input id="maxTenants" type="number" {...form.register("maxTenants")} />
            {form.formState.errors.maxTenants && <p className="text-sm text-destructive mt-1">{form.formState.errors.maxTenants.message}</p>}
        </div>
      </div>
      
      {/* Form Fields: Type, Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Property Type</Label>
            <Select onValueChange={(v) => form.setValue("type", v as any)} defaultValue={form.getValues("type")}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.type && <p className="text-sm text-destructive mt-1">{form.formState.errors.type.message}</p>}
        </div>
        <div>
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(v) => form.setValue("status", v as any)} defaultValue={form.getValues("status")}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.status && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.status.message}
              </p>
            )}
        </div>
      </div>
     
      {/* Form Field: Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="A brief description of the property" {...form.register("description")} />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button variant="slate" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : property ? "Update Property" : "Add Property"}
        </Button>
      </div>
    </form>
  );
}