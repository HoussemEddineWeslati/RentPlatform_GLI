// src/pages/claims/[id].tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { apiRequest, apiDownloadRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClaimForm } from "@/components/claim-form/claim-form";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Edit,
  FileDown,
  AlertCircle,
  DollarSign,
  Calendar,
  FileText,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import type { ClaimDetailApiResponse } from "@/types/schema/claimSchema";

export default function ClaimDetailPage() {
  const [, params] = useRoute("/claims/:id");
  const claimId = params?.id;
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: claimResponse, isLoading } = useQuery<ClaimDetailApiResponse>({
    queryKey: ["/api/claims", claimId],
    queryFn: () => apiRequest("GET", `/api/claims/${claimId}`),
    enabled: !!claimId,
  });

  const claimData = useMemo(() => {
    if (!claimResponse) return null;
    if (claimResponse.success && claimResponse.data) {
      return claimResponse.data;
    }
    if ('claim' in claimResponse) {
      return claimResponse as any;
    }
    return null;
  }, [claimResponse]);

  const handleDownload = async () => {
    if (!claimData) return;
    try {
      await apiDownloadRequest(
        "GET",
        `/api/claims/${claimId}/download`,
        undefined,
        `Claim-${claimData.claim.claimNumber}.pdf`
      );
      toast({ title: "Download Started" });
    } catch (error: any) {
      toast({ title: "Download Failed", description: error?.message, variant: "destructive" });
    }
  };

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
    return <div className="container mx-auto pt-24 pb-10">Loading claim details...</div>;
  }

  if (!claimData) {
    return <div className="container mx-auto pt-24 pb-10">Claim not found.</div>;
  }

  const { claim, policy, tenant } = claimData;

  return (
    <div className="container mx-auto pt-24 pb-10 px-4">
      <Link href="/claims">
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Claims
        </Button>
      </Link>

      {/* Claim Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-primary" />
                {claim.claimNumber}
              </CardTitle>
              <div className="flex gap-3 mt-3">
                {getStatusBadge(claim.status)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Update Status
              </Button>
              <Button onClick={handleDownload}>
                <FileDown className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Claim Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Amount Requested</p>
              <p className="font-medium text-lg">TND {parseFloat(claim.amountRequested).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Months of Unpaid Rent</p>
              <p className="font-medium">{claim.monthsOfUnpaidRent} months</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Rent</p>
              <p className="font-medium">TND {parseFloat(tenant.rentAmount).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Date Filed</p>
              <p className="font-medium">{new Date(claim.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{new Date(claim.updatedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Policy Period</p>
              <p className="font-medium">
                {new Date(policy.startDate).toLocaleDateString()} - {new Date(policy.endDate).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Policy & Tenant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Related Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Policy Number</p>
              <Link href={`/policies/${policy.id}`}>
                <p className="font-medium hover:text-primary cursor-pointer">{policy.policyNumber}</p>
              </Link>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tenant</p>
              <p className="font-medium">{tenant.name}</p>
              <p className="text-sm text-muted-foreground">{tenant.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evidence Links */}
      {claim.evidenceLinks && claim.evidenceLinks.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              Evidence Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {claim.evidenceLinks.map((link: string, index: number) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-md hover:bg-muted transition-colors"
                >
                  <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{link}</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {claim.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{claim.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Update Status Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Claim Status</DialogTitle>
          </DialogHeader>
          <ClaimForm
            claim={{
              id: claim.id,
              policyId: claim.policyId,
              status: claim.status as any,
              amountRequested: parseFloat(claim.amountRequested),
              monthsOfUnpaidRent: claim.monthsOfUnpaidRent,
              evidenceLinks: claim.evidenceLinks || undefined,
              notes: claim.notes || undefined,
            }}
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
