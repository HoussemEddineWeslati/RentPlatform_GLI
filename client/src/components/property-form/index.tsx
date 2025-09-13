import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPropertySchema, type InsertProperty } from "@shared/schema";
import { z } from "zod";

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  rentAmount: string;
  userId: string;
}

interface PropertyFormProps {
  property?: Property | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const propertyFormSchema = insertPropertySchema.extend({
  rentAmount: z.string().min(1, "Rent amount is required"),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

export function PropertyForm({ property, onSuccess, onCancel }: PropertyFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: property?.name || "",
      address: property?.address || "",
      type: property?.type || "",
      rentAmount: property?.rentAmount || "",
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: (data: PropertyFormData) => apiRequest("POST", "/api/properties", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property created",
        description: "The property has been added successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to create property",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: (data: PropertyFormData) => 
      apiRequest("PATCH", `/api/properties/${property?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property updated",
        description: "The property has been updated successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to update property",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PropertyFormData) => {
    if (property) {
      updatePropertyMutation.mutate(data);
    } else {
      createPropertyMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Property Name</Label>
        <Input
          id="name"
          placeholder="Enter property name"
          data-testid="input-property-name"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Enter property address"
          data-testid="input-property-address"
          {...form.register("address")}
        />
        {form.formState.errors.address && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.address.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="type">Property Type</Label>
        <Select
          onValueChange={(value) => form.setValue("type", value)}
          defaultValue={form.getValues("type")}
        >
          <SelectTrigger data-testid="select-property-type">
            <SelectValue placeholder="Select property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="studio">Studio</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.type && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.type.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="rentAmount">Monthly Rent (TND)</Label>
        <Input
          id="rentAmount"
          type="number"
          placeholder="Enter monthly rent amount"
          data-testid="input-rent-amount"
          {...form.register("rentAmount")}
        />
        {form.formState.errors.rentAmount && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.rentAmount.message}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending}
          data-testid="button-save-property"
        >
          {createPropertyMutation.isPending || updatePropertyMutation.isPending
            ? "Saving..." 
            : property ? "Update Property" : "Add Property"}
        </Button>
      </div>
    </form>
  );
}