// client/src/pages/landlords/[id]/policies.tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { apiRequest, apiDownloadRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Shield, FileDown } from "lucide-react";

// Policy type for this component
interface PolicyItem {
  id: string;
  policyNumber: string;
  status: string;
  tenantName: string;
  propertyName: string;
  riskScore: string | number;
}

export default function LandlordPoliciesPage() {
  const [, params] = useRoute("/landlords/:id/policies");
  const landlordId = params?.id;
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fixed: Fetch policies and handle response structure
  const { data: policiesResponse, isLoading } = useQuery({
    queryKey: ["/api/policies/landlord", landlordId],
    queryFn: () => apiRequest("GET", `/api/policies/landlord/${landlordId}`),
    enabled: !!landlordId,
  });

  // ✅ Fixed: Extract policies array from response with proper error handling
  const policies = useMemo((): PolicyItem[] => {
    if (!policiesResponse) return [];
    
    // Handle different response formats
    if (Array.isArray(policiesResponse)) {
      return policiesResponse;
    }
    
    if (policiesResponse.success && Array.isArray(policiesResponse.data)) {
      return policiesResponse.data;
    }
    
    // Fallback for unexpected formats
    console.warn("Unexpected policies response format:", policiesResponse);
    return [];
  }, [policiesResponse]);

  const { data: landlord } = useQuery({
    queryKey: ["/api/landlords", landlordId],
    queryFn: () => apiRequest("GET", `/api/landlords/${landlordId}`),
    enabled: !!landlordId,
  });

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

  const filteredPolicies = useMemo(
    () =>
      policies.filter(
        (p: PolicyItem) =>
          p.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.tenantName?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">
            Policies for {landlord?.name}
          </h1>
          <p className="text-muted-foreground">
            All insurance policies for this landlord's properties.
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by policy number or tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p>Loading policies...</p>
      ) : filteredPolicies.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {policies.length === 0
                ? "No Policies Yet"
                : "No Matching Policies"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {policies.length === 0
                ? "This landlord doesn't have any policies yet."
                : "Try a different search term."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map((policy: PolicyItem) => (
            <Card key={policy.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link href={`/policies/${policy.id}`}>
                      <h3 className="font-semibold text-lg hover:underline">
                        {policy.policyNumber}
                      </h3>
                    </Link>
                    {getStatusBadge(policy.status)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleDownload(policy.id!, policy.policyNumber!)
                    }
                  >
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Tenant:</span>{" "}
                    {policy.tenantName}
                  </div>
                  <div>
                    <span className="font-medium">Property:</span>{" "}
                    {policy.propertyName}
                  </div>
                  <div>
                    <span className="font-medium">Risk Score:</span>{" "}
                    {parseFloat(policy.riskScore as any).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}