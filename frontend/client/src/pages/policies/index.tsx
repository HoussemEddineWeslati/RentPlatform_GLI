// client/src/pages/policies/index.tsx
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, apiDownloadRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PolicyForm } from "@/components/policy-form/policy-form";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  FileDown,
  Shield,
} from "lucide-react";

// Policy type for the list view
interface PolicyListItem {
  id: string;
  policyNumber: string;
  tenantName: string;
  landlordName: string;
  status: string;
  decision: string;
}

// API response type for list
interface PoliciesApiResponse {
  success: boolean;
  data: PolicyListItem[];
}

// API response type for individual policy detail
interface PolicyDetailApiResponse {
  success: boolean;
  data: {
    policy: {
      id: string;
      userId: string;
      landlordId: string;
      propertyId: string;
      tenantId: string;
      policyNumber: string;
      status: string;
      coverageMonths: number;
      riskScore: string;
      decision: string;
      startDate: Date;
      endDate: Date;
      premiumAmount: string;
      createdAt: Date;
      updatedAt: Date;
    };
    tenant: {
      id: string;
      name: string;
      email: string;
      rentAmount: string;
    };
    property: {
      id: string;
      name: string;
      address: string;
      city: string;
      type: string;
    };
    landlord: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
}

export default function PoliciesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyListItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fixed: Properly typed query for full policy details
  const { data: fullPolicyResponse } = useQuery<PolicyDetailApiResponse>({
    queryKey: ["/api/policies", selectedPolicy?.id],
    enabled: !!selectedPolicy?.id && isFormOpen,
  });

  // Extract full policy data for the form
  const fullPolicyData = useMemo(() => {
    if (!fullPolicyResponse) return null;
    
    // Handle the properly typed response
    if (fullPolicyResponse.success && fullPolicyResponse.data) {
      const data = fullPolicyResponse.data;
      // Transform the nested response into the Policy type for the form
      return {
        id: data.policy.id,
        landlordId: data.policy.landlordId,
        propertyId: data.policy.propertyId,
        tenantId: data.policy.tenantId,
        policyNumber: data.policy.policyNumber,
        status: data.policy.status as "active" | "expired" | "cancelled",
        coverageMonths: data.policy.coverageMonths,
        riskScore: parseFloat(data.policy.riskScore),
        decision: data.policy.decision as "accept" | "conditional_accept" | "decline",
        startDate: new Date(data.policy.startDate).toISOString().split("T")[0],
        endDate: new Date(data.policy.endDate).toISOString().split("T")[0],
        premiumAmount: parseFloat(data.policy.premiumAmount),
      };
    }
    return null;
  }, [fullPolicyResponse]);

  // ✅ Fixed: Properly typed query for policies list
  const { data: policiesResponse, isLoading } = useQuery<PoliciesApiResponse | PolicyListItem[]>({
    queryKey: ["/api/policies"],
  });

  // ✅ Fixed: Extract policies array from response with proper error handling
  const policies = useMemo((): PolicyListItem[] => {
    if (!policiesResponse) return [];
    
    // Handle different response formats
    if (Array.isArray(policiesResponse)) {
      return policiesResponse;
    }
    if ('success' in policiesResponse && policiesResponse.success && Array.isArray(policiesResponse.data)) {
      return policiesResponse.data;
    }
    
    // Fallback for unexpected formats
    console.warn("Unexpected policies response format:", policiesResponse);
    return [];
  }, [policiesResponse]);

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/policies/${selectedPolicy?.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      toast({ 
        title: "Policy Deleted", 
        description: "The policy has been successfully deleted." 
      });
      setIsAlertOpen(false);
      setSelectedPolicy(null);
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error?.message || "Could not delete the policy.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (policy: PolicyListItem) => {
    setSelectedPolicy(policy);
    setIsFormOpen(true);
  };

  const handleDelete = (policy: PolicyListItem) => {
    setSelectedPolicy(policy);
    setIsAlertOpen(true);
  };

  const handleDownload = async (policyId: string, policyNumber: string) => {
    try {
      await apiDownloadRequest(
        "GET",
        `/api/policies/${policyId}/download`,
        undefined,
        `Policy-${policyNumber}.pdf`
      );
      toast({
        title: "Download Started",
        description: "Your policy PDF is being downloaded.",
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error?.message || "Could not download the policy.",
        variant: "destructive",
      });
    }
  };

  // Filter policies based on search term
  const filteredPolicies = useMemo(
    () =>
      policies.filter(
        (p: PolicyListItem) =>
          p.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.landlordName?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [policies, searchTerm]
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      expired: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={variants[status] || "bg-gray-100"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getDecisionBadge = (decision: string) => {
    const variants: Record<string, string> = {
      accept: "bg-green-100 text-green-800",
      conditional_accept: "bg-yellow-100 text-yellow-800",
      decline: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      accept: "Accepted",
      conditional_accept: "Conditional",
      decline: "Declined",
    };
    return (
      <Badge className={variants[decision] || "bg-gray-100"}>
        {labels[decision] || decision}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto pt-24 pb-10 text-center">
        Loading policies...
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-24 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="ml-8">
          <h1 className="text-3xl font-bold tracking-tight">Insurance Policies</h1>
          <p className="text-muted-foreground">
            Manage all insurance policies and coverage contracts.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-start">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            variant="slate"
            onClick={() => {
              setSelectedPolicy(null);
              setIsFormOpen(true);
            }}
            className="whitespace-nowrap"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Policy
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-2xl shadow-lg border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
              <tr className="text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">Policy Number</th>
                <th className="px-6 py-3 font-medium">Tenant</th>
                <th className="px-6 py-3 font-medium">Landlord</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium text-center">Decision</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-muted-foreground"
                  >
                    {policies.length === 0 ? (
                      <div className="flex flex-col items-center gap-4">
                        <Shield className="h-12 w-12 text-muted-foreground" />
                        <div>
                          <p className="font-medium mb-1">No policies yet</p>
                          <p className="text-sm">Create your first policy to get started.</p>
                        </div>
                      </div>
                    ) : (
                      "No policies match your search."
                    )}
                  </td>
                </tr>
              )}
              {filteredPolicies.map((policy: PolicyListItem, idx: number) => (
                <tr
                  key={policy.id}
                  className={`transition-colors ${
                    idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                  } hover:bg-accent/40`}
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/policies/${policy.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {policy.policyNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{policy.tenantName}</td>
                  <td className="px-6 py-4">{policy.landlordName}</td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(policy.status)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getDecisionBadge(policy.decision)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-accent"
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(policy)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Status
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownload(policy.id!, policy.policyNumber!)}
                        >
                          <FileDown className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(policy)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-3 border-t bg-muted/30">
          <span className="text-xs text-muted-foreground">
            Showing {filteredPolicies.length} policies
          </span>
        </div>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPolicy ? "Update Policy Status" : "Create New Policy"}
            </DialogTitle>
            <DialogDescription>
              {selectedPolicy
                ? "Update the status of this insurance policy."
                : "Fill in the details to create a new insurance policy."}
            </DialogDescription>
          </DialogHeader>
          {/* Only render form when we have full policy data for editing, or when creating new */}
          {(!selectedPolicy || fullPolicyData) ? (
            <PolicyForm
              policy={fullPolicyData}
              onSuccess={() => {
                setIsFormOpen(false);
                setSelectedPolicy(null);
              }}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedPolicy(null);
              }}
            />
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading policy details...</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the policy.
              Note: Policies with active claims cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}