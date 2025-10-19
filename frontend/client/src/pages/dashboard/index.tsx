// src/pages/dashboard/index.tsx
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Building,
  UserPlus,
  Calculator,
  FileDown,
  Calendar,
  ArrowRight
} from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  email: string;
  rentAmount: string;
  paymentStatus: string;
  propertyId: string;
}

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        navigate("/login");
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast, navigate]);

  const { data: tenants = [], isLoading: tenantsLoading, error: tenantsError } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
    enabled: isAuthenticated,
  });

  // Handle query errors
  useEffect(() => {
    if (tenantsError && isUnauthorizedError(tenantsError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        navigate("/login");
      }, 500);
    }
  }, [tenantsError, toast, navigate]);

  if (isLoading || tenantsLoading) {
    return (
      <div className="pt-16 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalTenants = tenants.length;
  const unpaidTenants = tenants.filter(t => t.paymentStatus === "overdue").length;
  const monthlyIncome = tenants.reduce((sum, tenant) => sum + parseFloat(tenant.rentAmount), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="pt-16 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-dashboard-title">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back! Here's your rental portfolio overview.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Tenants</p>
                  <p className="text-3xl font-bold" data-testid="text-total-tenants">{totalTenants}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <Users className="text-2xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Unpaid Rents</p>
                  <p className="text-3xl font-bold text-destructive" data-testid="text-unpaid-rents">
                    {unpaidTenants}
                  </p>
                </div>
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="text-destructive text-2xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Monthly Income</p>
                  <p className="text-3xl font-bold text-accent" data-testid="text-monthly-income">
                    {monthlyIncome.toFixed(0)} TND
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <TrendingUp className="text-accent text-2xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Properties</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="text-total-properties">
                    {new Set(tenants.map(t => t.propertyId)).size}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Building className="text-primary text-2xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Tenant Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tenant Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Recent Tenants</h2>
                  <Link href="/tenants" data-testid="link-view-all-tenants">
                    <Button variant="ghost" className="text-primary hover:opacity-80 font-medium">
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {tenants.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No tenants yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding your first tenant to track rent payments.
                    </p>
                    <Link href="/tenants" data-testid="link-add-first-tenant">
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Your First Tenant
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-sm font-medium text-muted-foreground pb-3">Tenant</th>
                          <th className="text-left text-sm font-medium text-muted-foreground pb-3">Rent</th>
                          <th className="text-left text-sm font-medium text-muted-foreground pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {tenants.slice(0, 5).map((tenant) => (
                          <tr key={tenant.id} className="hover:bg-muted">
                            <td className="py-4" data-testid={`row-tenant-${tenant.id}`}>
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium mr-3">
                                  {getInitials(tenant.name)}
                                </div>
                                <span className="font-medium text-foreground">{tenant.name}</span>
                              </div>
                            </td>
                            <td className="py-4 text-foreground font-medium">{tenant.rentAmount} TND</td>
                            <td className="py-4">{getStatusBadge(tenant.paymentStatus)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/tenants" data-testid="link-add-tenant">
                    <Button variant="ghost" className="w-full justify-between p-3 bg-muted hover:bg-secondary">
                      <div className="flex items-center">
                        <UserPlus className="text-primary mr-3 h-5 w-5" />
                        <span className="font-medium">Add Tenant</span>
                      </div>
                      <ArrowRight className="text-muted-foreground h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/quote" data-testid="link-calculate-quote">
                    <Button variant="ghost" className="w-full justify-between p-3 bg-muted hover:bg-secondary">
                      <div className="flex items-center">
                        <Calculator className="text-accent mr-3 h-5 w-5" />
                        <span className="font-medium">Calculate Quote</span>
                      </div>
                      <ArrowRight className="text-muted-foreground h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-between p-3 bg-muted hover:bg-secondary" data-testid="button-export-report">
                    <div className="flex items-center">
                      <FileDown className="text-purple-600 mr-3 h-5 w-5" />
                      <span className="font-medium">Export Report</span>
                    </div>
                    <ArrowRight className="text-muted-foreground h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Alerts</h3>
                <div className="space-y-3">
                  {unpaidTenants > 0 ? (
                    tenants
                      .filter(t => t.paymentStatus === "overdue")
                      .slice(0, 2)
                      .map((tenant) => (
                        <div key={tenant.id} className="flex items-start p-3 bg-red-50 rounded-lg border-l-4 border-destructive">
                          <AlertTriangle className="text-destructive mr-3 mt-1 h-4 w-4" />
                          <div>
                            <p className="font-medium text-sm">Rent Overdue</p>
                            <p className="text-xs text-muted-foreground">{tenant.name}</p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No recent alerts</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}