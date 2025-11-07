//src\components\landlord-form\index.tsx :
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { insertLandlordSchema, Landlord } from "@/types/schema";

interface LandlordFormProps {
  landlord?: Landlord | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// Create a form-specific schema, omitting server-managed fields
const landlordFormSchema = insertLandlordSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  propertyCount: true
});
type LandlordFormData = z.infer<typeof landlordFormSchema>;

export function LandlordForm({ landlord, onSuccess, onCancel }: LandlordFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LandlordFormData>({
    resolver: zodResolver(landlordFormSchema),
    defaultValues: {
      name: landlord?.name || "",
      email: landlord?.email || "",
      phone: landlord?.phone || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: LandlordFormData) =>
      landlord
        ? apiRequest("PATCH", `/api/landlords/${landlord.id}`, data)
        : apiRequest("POST", "/api/landlords", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/landlords"] });
      toast({
        title: landlord ? "Landlord Updated" : "Landlord Created",
        description: `The landlord has been ${landlord ? "updated" : "created"} successfully.`,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: `Failed to ${landlord ? "update" : "create"} landlord`,
        description: error?.message ?? String(error),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LandlordFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="Enter landlord's full name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" placeholder="Enter email address" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" placeholder="Enter phone number" {...form.register("phone")} />
        {form.formState.errors.phone && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="slate" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : landlord ? "Update Landlord" : "Add Landlord"}
        </Button>
      </div>
    </form>
  );
}