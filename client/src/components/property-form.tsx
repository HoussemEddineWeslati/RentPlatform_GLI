import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPropertySchema, type InsertProperty, type Property } from "@shared/schema";

// Create client-side schema that omits userId (server will add it)
const clientPropertySchema = insertPropertySchema.omit({ userId: true });
type PropertyFormValues = z.infer<typeof clientPropertySchema>;

interface PropertyFormProps {
  property?: Property;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PropertyForm({ property, onSuccess, onCancel }: PropertyFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(clientPropertySchema),
    defaultValues: property ? {
      name: property.name,
      address: property.address,
      type: property.type,
      description: property.description || "",
    } : {
      name: "",
      address: "",
      type: "",
      description: "",
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormValues) => {
      const response = await apiRequest("POST", "/api/properties", data);
      return response.json();
    },
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
    mutationFn: async (data: Partial<Property>) => {
      const response = await apiRequest("PATCH", `/api/properties/${property?.id}`, data);
      return response.json();
    },
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

  const onSubmit = (data: PropertyFormValues) => {
    if (property) {
      updatePropertyMutation.mutate(data);
    } else {
      createPropertyMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="type">Property Type</Label>
          <Select 
            value={form.watch("type")} 
            onValueChange={(value) => form.setValue("type", value)}
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
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Enter property description"
          rows={3}
          data-testid="textarea-property-description"
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
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
            : property
            ? "Update Property"
            : "Add Property"}
        </Button>
      </div>
    </form>
  );
}
