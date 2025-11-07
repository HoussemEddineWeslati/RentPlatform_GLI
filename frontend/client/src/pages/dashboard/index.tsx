// src/pages/dashboard/index.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Building,
  Shield,
  AlertCircle,
  DollarSign,
  ArrowRight,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Plus
} from "lucide-react";

interface Landlord {
  id: string;
  name: string;
  email: string;
  propertyCount: number;
}

interface Policy {
  id: string;
  policyNumber: string;
  status: string;
  premiumAmount: string;
}

interface Claim {
  id: string;
  claimNumber: string;
  status: string;
  amountRequested: string;
  landlordName: string;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  rentAmount: string;
  paymentStatus: string;
  propertyId: string;
}

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please login to access the dashboard.",
        variant: "destructive",
      });
      setTimeout(() => navigate("/login"), 500);
    }
  }, [isAuthenticated, authLoading, toast, navigate]);

  // Fetch all data
  const { data: landlords = [], isLoading: landlordsLoading } = useQuery<Landlord[]>({
    queryKey: ["/api/landlords"],
    enabled: isAuthenticated,
  });

  const { data: policiesResponse, isLoading: policiesLoading } = useQuery({
    queryKey: ["/api/policies"],
    enabled: isAuthenticated,
  });

  const { data: claimsResponse, isLoading: claimsLoading } = useQuery({
    queryKey: ["/api/claims"],
    enabled: isAuthenticated,
  });

  const { data: tenants = [], isLoading: tenantsLoading } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
    enabled: isAuthenticated,
  });

  // Extract policies and claims from responses
  const policies: Policy[] = Array.isArray(policiesResponse) 
    ? policiesResponse 
    : (policiesResponse as any)?.success && Array.isArray((policiesResponse as any).data)
    ? (policiesResponse as any).data
    : [];

  const claims: Claim[] = Array.isArray(claimsResponse)
    ? claimsResponse
    : (claimsResponse as any)?.success && Array.isArray((claimsResponse as any).data)
    ? (claimsResponse as any).data
    : [];

  const isLoading = authLoading || landlordsLoading || policiesLoading || claimsLoading || tenantsLoading;

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Calculate statistics
  const totalLandlords = landlords.length;
  const totalProperties = landlords.reduce((sum, l) => sum + (l.propertyCount || 0), 0);
  const totalTenants = tenants.length;
  
  const activePolicies = policies.filter(p => p.status === "active").length;
  const totalPolicies = policies.length;
  const monthlyPremiumRevenue = policies
    .filter(p => p.status === "active")
    .reduce((sum, p) => sum + parseFloat(p.premiumAmount || "0"), 0);

  const pendingClaims = claims.filter(c => c.status === "pending" || c.status === "under_review").length;
  const approvedClaims = claims.filter(c => c.status === "approved").length;
  const totalClaimAmount = claims
    .filter(c => c.status === "approved" || c.status === "paid")
    .reduce((sum, c) => sum + parseFloat(c.amountRequested || "0"), 0);

  const unpaidTenants = tenants.filter(t => t.paymentStatus === "overdue").length;
  const totalRentCollected = tenants
    .filter(t => t.paymentStatus === "paid")
    .reduce((sum, t) => sum + parseFloat(t.rentAmount || "0"), 0);

  const userData = (user as any)?.data || user;
  const userName = userData?.firstName || "User";

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      paid: "bg-purple-100 text-purple-800",
      overdue: "bg-red-100 text-red-800",
    };
    return <Badge className={variants[status as keyof typeof variants] || "bg-gray-100"}>{status}</Badge>;
  };

  return (
    <div className="pt-16 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your insurance portfolio today.</p>
        </div>

        {/* Key Metrics - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-blue-100 rounded-full p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Landlords</p>
                <p className="text-3xl font-bold text-foreground">{totalLandlords}</p>
                <p className="text-xs text-muted-foreground mt-1">{totalProperties} properties managed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-green-100 rounded-full p-3">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Policies</p>
                <p className="text-3xl font-bold text-foreground">{activePolicies}</p>
                <p className="text-xs text-muted-foreground mt-1">{totalPolicies} total policies</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-yellow-100 rounded-full p-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Claims</p>
                <p className="text-3xl font-bold text-foreground">{pendingClaims}</p>
                <p className="text-xs text-muted-foreground mt-1">{approvedClaims} approved</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue Payments</p>
                <p className="text-3xl font-bold text-destructive">{unpaidTenants}</p>
                <p className="text-xs text-muted-foreground mt-1">{totalTenants} total tenants</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Metrics - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white rounded-full p-3 shadow-sm">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Monthly Premium Revenue</p>
                <p className="text-3xl font-bold text-green-900">TND {monthlyPremiumRevenue.toFixed(2)}</p>
                <p className="text-xs text-green-700 mt-1">From {activePolicies} active policies</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white rounded-full p-3 shadow-sm">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Total Rent Collected</p>
                <p className="text-3xl font-bold text-blue-900">TND {totalRentCollected.toFixed(2)}</p>
                <p className="text-xs text-blue-700 mt-1">This month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white rounded-full p-3 shadow-sm">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">Claims Payout</p>
                <p className="text-3xl font-bold text-purple-900">TND {totalClaimAmount.toFixed(2)}</p>
                <p className="text-xs text-purple-700 mt-1">Approved & paid</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Claims */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Recent Claims
                  </CardTitle>
                  <Link href="/claims">
                    <Button variant="ghost" size="sm" className="text-primary">
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {claims.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">No claims submitted yet</p>
                    <Link href="/claims">
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Claim
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {claims.slice(0, 5).map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-accent transition-colors">
                        <div className="flex-1">
                          <Link href={`/claims/${claim.id}`}>
                            <p className="font-medium text-sm hover:text-primary cursor-pointer">{claim.claimNumber}</p>
                          </Link>
                          <p className="text-xs text-muted-foreground">{claim.landlordName}</p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-sm font-medium">TND {parseFloat(claim.amountRequested).toFixed(2)}</p>
                        </div>
                        {getStatusBadge(claim.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Policies */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Recent Policies
                  </CardTitle>
                  <Link href="/policies">
                    <Button variant="ghost" size="sm" className="text-primary">
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {policies.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">No policies created yet</p>
                    <Link href="/policies">
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Policy
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {policies.slice(0, 5).map((policy) => (
                      <div key={policy.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-accent transition-colors">
                        <div className="flex-1">
                          <Link href={`/policies/${policy.id}`}>
                            <p className="font-medium text-sm hover:text-primary cursor-pointer">{policy.policyNumber}</p>
                          </Link>
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-sm font-medium">TND {parseFloat(policy.premiumAmount).toFixed(2)}</p>
                        </div>
                        {getStatusBadge(policy.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Link href="/landlords">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Landlords
                    </Button>
                  </Link>
                  <Link href="/policies">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="mr-2 h-4 w-4" />
                      Create Policy
                    </Button>
                  </Link>
                  <Link href="/claims">
                    <Button variant="outline" className="w-full justify-start">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Submit Claim
                    </Button>
                  </Link>
                  <Link href="/quote">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Risk Assessment
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            {unpaidTenants > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="border-b border-red-200">
                  <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    Attention Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-red-900">{unpaidTenants} Overdue Payments</p>
                        <p className="text-xs text-red-700">Immediate action required</p>
                      </div>
                    </div>
                    {pendingClaims > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                        <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-yellow-900">{pendingClaims} Pending Claims</p>
                          <p className="text-xs text-yellow-700">Review required</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}