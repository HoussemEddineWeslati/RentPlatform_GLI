// ============================================================================
// FILE 1: client/src/pages/claims/index.tsx
// ============================================================================
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
import { ClaimForm } from "@/components/claim-form/claim-form";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  FileDown,
  AlertCircle,
} from "lucide-react";
import type { ClaimListItem, ClaimsApiResponse } from "@/types/schema/claimSchema";

export default function ClaimsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ClaimListItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: claimsResponse, isLoading } = useQuery<ClaimsApiResponse | ClaimListItem[]>({
    queryKey: ["/api/claims"],
  });

  const claims = useMemo((): ClaimListItem[] => {
    if (!claimsResponse) return [];
    if (Array.isArray(claimsResponse)) return claimsResponse;
    if ('success' in claimsResponse && claimsResponse.success && Array.isArray(claimsResponse.data)) {
      return claimsResponse.data;
    }
    return [];
  }, [claimsResponse]);

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/claims/${selectedClaim?.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      toast({ title: "Claim Deleted" });
      setIsAlertOpen(false);
      setSelectedClaim(null);
    },
    onError: (error: any) => {
      toast({ title: "Deletion Failed", description: error?.message, variant: "destructive" });
    },
  });

  const handleEdit = (claim: ClaimListItem) => {
    setSelectedClaim(claim);
    setIsFormOpen(true);
  };

  const handleDelete = (claim: ClaimListItem) => {
    setSelectedClaim(claim);
    setIsAlertOpen(true);
  };

  const handleDownload = async (claimId: string, claimNumber: string) => {
    try {
      await apiDownloadRequest("GET", `/api/claims/${claimId}/download`, undefined, `Claim-${claimNumber}.pdf`);
      toast({ title: "Download Started" });
    } catch (error: any) {
      toast({ title: "Download Failed", description: error?.message, variant: "destructive" });
    }
  };

  const filteredClaims = useMemo(
    () =>
      claims.filter(
        (c) =>
          c.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.landlordName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [claims, searchTerm]
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      under_review: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      paid: "bg-purple-100 text-purple-800",
    };
    const labels: Record<string, string> = {
      pending: "Pending",
      under_review: "Under Review",
      approved: "Approved",
      rejected: "Rejected",
      paid: "Paid",
    };
    return <Badge className={variants[status] || "bg-gray-100"}>{labels[status] || status}</Badge>;
  };

  if (isLoading) {
    return <div className="container mx-auto pt-24 pb-10 text-center">Loading claims...</div>;
  }

  return (
    <div className="container mx-auto pt-24 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="ml-8">
          <h1 className="text-3xl font-bold tracking-tight">Insurance Claims</h1>
          <p className="text-muted-foreground">Manage and track all insurance claims.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-start">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search claims..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="slate" onClick={() => { setSelectedClaim(null); setIsFormOpen(true); }} className="whitespace-nowrap">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Claim
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl shadow-lg border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
              <tr className="text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">Claim Number</th>
                <th className="px-6 py-3 font-medium">Landlord</th>
                <th className="px-6 py-3 font-medium">Policy Number</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    {claims.length === 0 ? (
                      <div className="flex flex-col items-center gap-4">
                        <AlertCircle className="h-12 w-12 text-muted-foreground" />
                        <div>
                          <p className="font-medium mb-1">No claims yet</p>
                          <p className="text-sm">Submit your first claim to get started.</p>
                        </div>
                      </div>
                    ) : (
                      "No claims match your search."
                    )}
                  </td>
                </tr>
              )}
              {filteredClaims.map((claim, idx) => (
                <tr
                  key={claim.id}
                  className={`transition-colors ${idx % 2 === 0 ? "bg-background" : "bg-muted/20"} hover:bg-accent/40`}
                >
                  <td className="px-6 py-4">
                    <Link href={`/claims/${claim.id}`} className="font-medium hover:text-primary transition-colors">
                      {claim.claimNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{claim.landlordName}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs">{claim.policyNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    TND {parseFloat(claim.amountRequested).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">{getStatusBadge(claim.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(claim)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(claim.id, claim.claimNumber)}>
                          <FileDown className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(claim)} className="text-destructive">
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
        <div className="flex justify-between items-center px-6 py-3 border-t bg-muted/30">
          <span className="text-xs text-muted-foreground">Showing {filteredClaims.length} claims</span>
        </div>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedClaim ? "Update Claim Status" : "Submit New Claim"}</DialogTitle>
            <DialogDescription>
              {selectedClaim ? "Update the status of this insurance claim." : "Fill in the details to submit a new insurance claim."}
            </DialogDescription>
          </DialogHeader>
          <ClaimForm
            claim={selectedClaim as any}
            onSuccess={() => { setIsFormOpen(false); setSelectedClaim(null); }}
            onCancel={() => { setIsFormOpen(false); setSelectedClaim(null); }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the claim.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}