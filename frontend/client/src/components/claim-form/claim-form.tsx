// src/components/claim-form/claim-form.tsx
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertClaimSchema, type Claim } from "@/types/schema/claimSchema";
import type { Landlord } from "@/types/schema";
import { X, Plus, Link as LinkIcon } from "lucide-react";

type TenantWithProperty = {
  id: string;
  name: string;
  email: string;
  propertyName: string;
  propertyId: string;
};

type PolicyOption = {
  id: string;
  policyNumber: string;
  status: string;
};

type ClaimFormProps = {
  claim?: Claim | null;
  landlordId?: string;
  policyId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ClaimForm({
  claim,
  landlordId,
  policyId,
  onSuccess,
  onCancel,
}: ClaimFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [evidenceLinks, setEvidenceLinks] = useState<string[]>(
    claim?.evidenceLinks || []
  );
  const [newLink, setNewLink] = useState("");

  const form = useForm({
    resolver: zodResolver(insertClaimSchema),
    defaultValues: {
      landlordId: landlordId || "",
      tenantId: "",
      policyId: claim?.policyId || policyId || "",
      status: claim?.status || "pending",
      amountRequested: claim?.amountRequested || 0,
      monthsOfUnpaidRent: claim?.monthsOfUnpaidRent || 0,
      notes: claim?.notes || "",
    },
  });

  // Fetch landlords
  const { data: landlords = [] } = useQuery<Landlord[]>({
    queryKey: ["/api/landlords"],
    enabled: !landlordId,
  });

  // Fetch tenants for selected landlord
  const selectedLandlordId = form.watch("landlordId");
  const { data: tenants = [] } = useQuery<TenantWithProperty[]>({
    queryKey: ["/api/landlords", selectedLandlordId, "tenants"],
    enabled: !!selectedLandlordId,
  });

  // Fetch policies for selected tenant
  const selectedTenantId = form.watch("tenantId");
  const { data: policiesResponse } = useQuery({
    queryKey: ["/api/policies/tenant", selectedTenantId],
    queryFn: () => apiRequest("GET", `/api/policies/tenant/${selectedTenantId}`),
    enabled: !!selectedTenantId,
  });

  // Extract policies array from response
  const policies = useMemo((): PolicyOption[] => {
    if (!policiesResponse) return [];
    
    // Handle array response
    if (Array.isArray(policiesResponse)) {
      return policiesResponse;
    }
    
    // Handle object with success/data
    if (typeof policiesResponse === 'object' && 'success' in policiesResponse) {
      const response = policiesResponse as any;
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
    }
    
    console.warn("Unexpected policies response:", policiesResponse);
    return [];
  }, [policiesResponse]);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      claim
        ? apiRequest("PATCH", `/api/claims/${claim.id}`, data)
        : apiRequest("POST", "/api/claims", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      if (landlordId) {
        queryClient.invalidateQueries({ queryKey: ["/api/claims/landlord", landlordId] });
      }
      toast({
        title: claim ? "Claim Updated" : "Claim Created",
        description: claim
          ? "The claim has been updated successfully."
          : "A new claim has been created successfully.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Operation Failed",
        description: error?.message || "Could not save the claim.",
        variant: "destructive",
      });
    },
  });

  const handleAddLink = () => {
    if (newLink.trim()) {
      try {
        new URL(newLink); // Validate URL
        setEvidenceLinks([...evidenceLinks, newLink.trim()]);
        setNewLink("");
      } catch {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid URL",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveLink = (index: number) => {
    setEvidenceLinks(evidenceLinks.filter((_, i) => i !== index));
  };

  const onSubmit = (data: any) => {
    const submitData = {
      policyId: data.policyId,
      status: data.status,
      amountRequested: data.amountRequested,
      monthsOfUnpaidRent: data.monthsOfUnpaidRent,
      evidenceLinks: evidenceLinks.length > 0 ? evidenceLinks : undefined,
      notes: data.notes || undefined,
    };
    mutation.mutate(submitData);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Landlord Selection */}
        {!landlordId && (
          <div className="md:col-span-2">
            <Label htmlFor="landlordId">Landlord *</Label>
            <Select
              onValueChange={(value) => {
                form.setValue("landlordId", value);
                form.setValue("tenantId", "");
                form.setValue("policyId", "");
              }}
              defaultValue={form.getValues("landlordId")}
              disabled={!!claim}
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
          </div>
        )}

        {/* Tenant Selection */}
        <div className="md:col-span-2">
          <Label htmlFor="tenantId">Tenant *</Label>
          <Select
            onValueChange={(value) => {
              form.setValue("tenantId", value);
              form.setValue("policyId", "");
            }}
            value={form.watch("tenantId")}
            disabled={!selectedLandlordId || !!claim}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tenant" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} - {t.propertyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Policy Selection */}
        <div className="md:col-span-2">
          <Label htmlFor="policyId">Policy *</Label>
          <Select
            onValueChange={(value) => form.setValue("policyId", value)}
            value={form.watch("policyId")}
            disabled={!selectedTenantId || policies.length === 0 || !!claim}
          >
            <SelectTrigger>
              <SelectValue placeholder={policies.length === 0 ? "No active policies" : "Select policy"} />
            </SelectTrigger>
            <SelectContent>
              {policies.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.policyNumber} - {p.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.policyId && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.policyId.message}
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Months of Unpaid Rent */}
        <div>
          <Label htmlFor="monthsOfUnpaidRent">Months of Unpaid Rent *</Label>
          <Input
            id="monthsOfUnpaidRent"
            type="number"
            min="0"
            {...form.register("monthsOfUnpaidRent", { valueAsNumber: true })}
          />
          {form.formState.errors.monthsOfUnpaidRent && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.monthsOfUnpaidRent.message}
            </p>
          )}
        </div>

        {/* Amount Requested */}
        <div className="md:col-span-2">
          <Label htmlFor="amountRequested">Amount Requested (TND) *</Label>
          <Input
            id="amountRequested"
            type="number"
            step="0.01"
            {...form.register("amountRequested", { valueAsNumber: true })}
          />
          {form.formState.errors.amountRequested && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.amountRequested.message}
            </p>
          )}
        </div>

        {/* Evidence Links */}
        <div className="md:col-span-2">
          <Label>Evidence Links (URLs)</Label>
          <div className="space-y-2">
            {evidenceLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 p-2 border rounded-md bg-muted">
                  <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm truncate hover:underline text-primary"
                  >
                    {link}
                  </a>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveLink(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/evidence/doc.pdf"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLink())}
              />
              <Button type="button" variant="outline" onClick={handleAddLink}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add URLs to evidence documents (e.g., Google Drive, Dropbox links)
            </p>
          </div>
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...form.register("notes")}
            placeholder="Additional information about the claim..."
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : claim ? "Update Claim" : "Submit Claim"}
        </Button>
      </div>
    </form>
  );
}