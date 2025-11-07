// client/src/pages/policies/[id].tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { apiRequest, apiDownloadRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PolicyForm } from "@/components/policy-form/policy-form";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Edit,
  FileDown,
  Shield,
  User,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";

// Types for the API response
interface PolicyDetailResponse {
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
}

export default function PolicyDetailPage() {
  const [, params] = useRoute("/policies/:id");
  const policyId = params?.id;
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ✅ Fixed: Handle response structure
  const { data: policyResponse, isLoading } = useQuery({
    queryKey: ["/api/policies", policyId],
    queryFn: () => apiRequest("GET", `/api/policies/${policyId}`),
    enabled: !!policyId,
  });

  // ✅ Extract policy data from response
  const policyData = useMemo((): PolicyDetailResponse | null => {
    if (!policyResponse) return null;
    
    // Handle different response formats
    if (policyResponse.success && policyResponse.data) {
      return policyResponse.data as PolicyDetailResponse;
    }
    
    // Direct data format (backward compatibility)
    if (policyResponse.policy) {
      return policyResponse as PolicyDetailResponse;
    }
    
    return null;
  }, [policyResponse]);

  const handleDownload = async () => {
    if (!policyData) return;
    try {
      await apiDownloadRequest(
        "GET",
        `/api/policies/${policyId}/download`,
        undefined,
        `Policy-${policyData.policy.policyNumber}.pdf`
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

  if (isLoading) {
    return <div className="container mx-auto pt-24 pb-10">Loading policy details...</div>;
  }

  if (!policyData) {
    return <div className="container mx-auto pt-24 pb-10">Policy not found.</div>;
  }

  const { policy, tenant, property, landlord } = policyData;

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

  return (
    <div className="container mx-auto pt-24 pb-10 px-4">
      <Link href="/policies">
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Policies
        </Button>
      </Link>

      {/* Policy Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                {policy.policyNumber}
              </CardTitle>
              <div className="flex gap-3 mt-3">
                {getStatusBadge(policy.status)}
                {getDecisionBadge(policy.decision)}
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

      {/* Policy Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Coverage Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Coverage Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">
                {new Date(policy.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium">
                {new Date(policy.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Coverage Period</p>
              <p className="font-medium">{policy.coverageMonths} months</p>
            </div>
          </CardContent>
        </Card>

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
              <p className="text-sm text-muted-foreground">Premium Amount</p>
              <p className="font-medium text-lg">
                TND {parseFloat(policy.premiumAmount).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Rent</p>
              <p className="font-medium">
                TND {parseFloat(tenant.rentAmount).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Coverage</p>
              <p className="font-medium">
                TND {(parseFloat(tenant.rentAmount) * policy.coverageMonths).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Risk Score</p>
              <p className="font-medium text-lg">{parseFloat(policy.riskScore).toFixed(2)} / 100</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Decision</p>
              <p className="font-medium">
                {policy.decision === "accept"
                  ? "Accepted"
                  : policy.decision === "conditional_accept"
                  ? "Conditional Accept"
                  : "Declined"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parties Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tenant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Tenant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{tenant.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{tenant.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{property.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">
                {property.address}, {property.city}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{property.type}</p>
            </div>
          </CardContent>
        </Card>

        {/* Landlord Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Landlord Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{landlord.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{landlord.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{landlord.phone}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Policy Status</DialogTitle>
          </DialogHeader>
          <PolicyForm
            policy={{
              id: policy.id,
              landlordId: policy.landlordId,
              propertyId: policy.propertyId,
              tenantId: policy.tenantId,
              policyNumber: policy.policyNumber,
              status: policy.status as any,
              coverageMonths: policy.coverageMonths,
              riskScore: parseFloat(policy.riskScore),
              decision: policy.decision as any,
              startDate: new Date(policy.startDate).toISOString(),
              endDate: new Date(policy.endDate).toISOString(),
              premiumAmount: parseFloat(policy.premiumAmount),
            }}
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}