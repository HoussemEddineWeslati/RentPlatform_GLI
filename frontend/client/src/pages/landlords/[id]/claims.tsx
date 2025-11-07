// src/pages/claims/[id].tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { apiRequest, apiDownloadRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClaimForm } from "@/components/claim-form/claim-form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, AlertCircle, FileDown, PlusCircle } from "lucide-react";
import type { ClaimListItem } from "@/types/schema/claimSchema";

export default function LandlordClaimsPage() {
  const [, params] = useRoute("/landlords/:id/claims");
  const landlordId = params?.id;
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: claims = [], isLoading } = useQuery<ClaimListItem[]>({
    queryKey: ["/api/claims/landlord", landlordId],
    queryFn: () => apiRequest("GET", `/api/claims/landlord/${landlordId}`),
    enabled: !!landlordId,
  });

  const { data: landlord } = useQuery({
    queryKey: ["/api/landlords", landlordId],
    queryFn: () => apiRequest("GET", `/api/landlords/${landlordId}`),
    enabled: !!landlordId,
  });

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

  return (
    <div className="container mx-auto pt-24 pb-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <Link href={`/landlords/${landlordId}`}>
            <Button variant="outline" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Landlord
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Claims for {landlord?.name}</h1>
          <p className="text-muted-foreground">All insurance claims for this landlord's properties.</p>
        </div>
        <Button variant="slate" onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Claim
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by claim or policy number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p>Loading claims...</p>
      ) : filteredClaims.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {claims.length === 0 ? "No Claims Yet" : "No Matching Claims"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {claims.length === 0
                ? "This landlord hasn't submitted any claims yet."
                : "Try a different search term."}
            </p>
            {claims.length === 0 && (
              <Button onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Submit First Claim
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClaims.map((claim) => (
            <Card key={claim.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link href={`/claims/${claim.id}`}>
                      <h3 className="font-semibold text-lg hover:underline">{claim.claimNumber}</h3>
                    </Link>
                    {getStatusBadge(claim.status)}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDownload(claim.id, claim.claimNumber)}>
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Policy:</span> {claim.policyNumber}
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span> TND {parseFloat(claim.amountRequested).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit New Claim</DialogTitle>
          </DialogHeader>
          <ClaimForm
            landlordId={landlordId}
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}