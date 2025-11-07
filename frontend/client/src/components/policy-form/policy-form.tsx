// src/components/policy-form/policy-form.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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
import { insertPolicySchema, type Policy } from "@/types/schema/policySchema";
import type { Landlord, Property, Tenant } from "@/types/schema";

type PolicyFormProps = {
  policy?: Policy | null;
  landlordId?: string;
  tenantId?: string;
  riskScore?: number;
  decision?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function PolicyForm({
  policy,
  landlordId,
  tenantId,
  riskScore,
  decision,
  onSuccess,
  onCancel,
}: PolicyFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertPolicySchema),
    defaultValues: {
      landlordId: policy?.landlordId || landlordId || "",
      propertyId: policy?.propertyId || "",
      tenantId: policy?.tenantId || tenantId || "",
      status: policy?.status || "active",
      coverageMonths: policy?.coverageMonths || 12,
      riskScore: policy?.riskScore || riskScore || 0,
      decision: policy?.decision || decision || "accept",
      startDate: policy?.startDate || new Date().toISOString().split("T")[0],
      endDate: policy?.endDate || "",
      premiumAmount: policy?.premiumAmount || 0,
    },
  });

  // Fetch landlords
  const { data: landlords = [] } = useQuery<Landlord[]>({
    queryKey: ["/api/landlords"],
  });

  // Fetch properties for selected landlord
  const selectedLandlordId = form.watch("landlordId");
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/landlords", selectedLandlordId, "properties"],
    enabled: !!selectedLandlordId,
  });

  // Fetch tenants for selected property
  const selectedPropertyId = form.watch("propertyId");
  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ["/api/properties", selectedPropertyId, "tenants"],
    enabled: !!selectedPropertyId,
  });

  // Auto-calculate end date based on start date and coverage months
  useEffect(() => {
    const startDate = form.watch("startDate");
    const coverageMonths = form.watch("coverageMonths");
    if (startDate && coverageMonths) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + coverageMonths);
      form.setValue("endDate", end.toISOString().split("T")[0]);
    }
  }, [form.watch("startDate"), form.watch("coverageMonths")]);

  // Auto-calculate premium based on property rent and coverage
  useEffect(() => {
    const propertyId = form.watch("propertyId");
    const coverageMonths = form.watch("coverageMonths");
    const selectedRiskScore = form.watch("riskScore");
    if (propertyId && coverageMonths) {
      const property = properties.find((p) => p.id === propertyId);
      if (property) {
        const monthlyRent = parseFloat(String(property.rentAmount) || "0");
        // Simple premium calculation: 3% of rent * coverage months * risk multiplier
        const riskMultiplier = selectedRiskScore < 50 ? 1.5 : selectedRiskScore < 75 ? 1.0 : 0.8;
        const premium = monthlyRent * 0.03 * coverageMonths * riskMultiplier;
        form.setValue("premiumAmount", Math.round(premium));
      }
    }
  }, [form.watch("propertyId"), form.watch("coverageMonths"), form.watch("riskScore"), properties]);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      policy
        ? apiRequest("PATCH", `/api/policies/${policy.id}/status`, data)
        : apiRequest("POST", "/api/policies", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      toast({
        title: policy ? "Policy Updated" : "Policy Created",
        description: policy
          ? "The policy has been updated successfully."
          : "A new policy has been created successfully.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Operation Failed",
        description: error?.message || "Could not save the policy.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Convert date strings (YYYY-MM-DD) to ISO datetime format for the backend
    const submitData = {
      ...data,
      startDate: `${data.startDate}T00:00:00.000Z`,
      endDate: `${data.endDate}T23:59:59.000Z`,
    };
    mutation.mutate(submitData);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Landlord Selection */}
        <div>
          <Label htmlFor="landlordId">Landlord *</Label>
          <Select
            onValueChange={(value) => {
              form.setValue("landlordId", value);
              form.setValue("propertyId", "");
              form.setValue("tenantId", "");
            }}
            defaultValue={form.getValues("landlordId")}
            disabled={!!policy}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select landlord" />
            </SelectTrigger>
            <SelectContent>
              {landlords.map((l) => (
                <SelectItem key={l.id} value={l.id!}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.landlordId && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.landlordId.message}
            </p>
          )}
        </div>

        {/* Property Selection */}
        <div>
          <Label htmlFor="propertyId">Property *</Label>
          <Select
            onValueChange={(value) => {
              form.setValue("propertyId", value);
              form.setValue("tenantId", "");
            }}
            value={form.watch("propertyId")}
            disabled={!selectedLandlordId || !!policy}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
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

        {/* Tenant Selection */}
        <div>
          <Label htmlFor="tenantId">Tenant *</Label>
          <Select
            onValueChange={(value) => form.setValue("tenantId", value)}
            value={form.watch("tenantId")}
            disabled={!selectedPropertyId || !!policy}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tenant" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id!}>
                  {t.name} - {t.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.tenantId && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.tenantId.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status">Status *</Label>
          <Select
            onValueChange={(value) => form.setValue("status", value as any)}
            defaultValue={form.getValues("status")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Coverage Months */}
        <div>
          <Label htmlFor="coverageMonths">Coverage Months *</Label>
          <Input
            id="coverageMonths"
            type="number"
            min="1"
            {...form.register("coverageMonths", { valueAsNumber: true })}
            disabled={!!policy}
          />
          {form.formState.errors.coverageMonths && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.coverageMonths.message}
            </p>
          )}
        </div>

        {/* Risk Score */}
        <div>
          <Label htmlFor="riskScore">Risk Score *</Label>
          <Input
            id="riskScore"
            type="number"
            min="0"
            max="100"
            step="0.01"
            {...form.register("riskScore", { valueAsNumber: true })}
            disabled={!!policy}
          />
          {form.formState.errors.riskScore && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.riskScore.message}
            </p>
          )}
        </div>

        {/* Decision */}
        <div>
          <Label htmlFor="decision">Decision *</Label>
          <Select
            onValueChange={(value) => form.setValue("decision", value as any)}
            defaultValue={form.getValues("decision")}
            disabled={!!policy}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select decision" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="accept">Accept</SelectItem>
              <SelectItem value="conditional_accept">Conditional Accept</SelectItem>
              <SelectItem value="decline">Decline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Start Date */}
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            {...form.register("startDate")}
            disabled={!!policy}
          />
          {form.formState.errors.startDate && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.startDate.message}
            </p>
          )}
        </div>

        {/* End Date (Auto-calculated) */}
        <div>
          <Label htmlFor="endDate">End Date (Auto-calculated)</Label>
          <Input
            id="endDate"
            type="date"
            {...form.register("endDate")}
            disabled
            className="bg-muted"
          />
        </div>

        {/* Premium Amount (Auto-calculated) */}
        <div>
          <Label htmlFor="premiumAmount">Premium Amount (TND) *</Label>
          <Input
            id="premiumAmount"
            type="number"
            step="0.01"
            {...form.register("premiumAmount", { valueAsNumber: true })}
            className="bg-muted"
            disabled={!!policy}
          />
          {form.formState.errors.premiumAmount && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.premiumAmount.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : policy ? "Update Policy" : "Create Policy"}
        </Button>
      </div>
    </form>
  );
}