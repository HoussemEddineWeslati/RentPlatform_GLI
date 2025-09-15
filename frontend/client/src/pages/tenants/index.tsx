import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TenantForm } from "@/components/tenant-form";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { apiRequest } from "@/lib/api";
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  CheckCircle, 
  Mail, 
  Trash2,
  AlertTriangle
} from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  email: string;
  rentAmount: string;
  paymentStatus: string;
  propertyId: string;
  userId: string;
}

export default function Tenants() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const deleteTenantMutation = useMutation({
    mutationFn: (tenantId: string) => apiRequest("DELETE", `/api/tenants/${tenantId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({
        title: "Tenant deleted",
        description: "The tenant has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete tenant",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: (tenantId: string) => 
      apiRequest("PATCH", `/api/tenants/${tenantId}`, { 
        paymentStatus: "paid",
        lastPaymentDate: new Date()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({
        title: "Payment status updated",
        description: "Tenant marked as paid.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading || tenantsLoading) {
    return (
      <div className="pt-16 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || tenant.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Paid</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="mr-1 h-3 w-3" />Overdue</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleDelete = (tenant: Tenant) => {
    if (window.confirm(`Are you sure you want to delete ${tenant.name}?`)) {
      deleteTenantMutation.mutate(tenant.id);
    }
  };

  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
    setEditingTenant(null);
  };

  const handleFormCancel = () => {
    setIsAddDialogOpen(false);
    setEditingTenant(null);
  };

  return (
    <div className="pt-16 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-tenants-title">
              Tenant Management
            </h1>
            <p className="text-muted-foreground">Manage your tenants and track payment status</p>
          </div>
          <Button 
            className="mt-4 sm:mt-0"
            onClick={() => setIsAddDialogOpen(true)}
            data-testid="button-add-tenant"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Tenant
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-tenants"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40" data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenants List */}
        <Card>
          <CardContent className="p-6">
            {filteredTenants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {tenants.length === 0 ? "No tenants yet" : "No tenants found"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {tenants.length === 0 
                    ? "Start by adding your first tenant to track rent payments."
                    : "Try adjusting your search criteria."}
                </p>
                {tenants.length === 0 && (
                  <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-tenant">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Your First Tenant
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-sm font-medium text-muted-foreground pb-3">Tenant</th>
                      <th className="text-left text-sm font-medium text-muted-foreground pb-3">Email</th>
                      <th className="text-left text-sm font-medium text-muted-foreground pb-3">Rent</th>
                      <th className="text-left text-sm font-medium text-muted-foreground pb-3">Status</th>
                      <th className="text-left text-sm font-medium text-muted-foreground pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-muted" data-testid={`row-tenant-${tenant.id}`}>
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium mr-3">
                              {getInitials(tenant.name)}
                            </div>
                            <span className="font-medium text-foreground">{tenant.name}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center text-muted-foreground">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="text-sm">{tenant.email}</span>
                          </div>
                        </td>
                        <td className="py-4 text-foreground font-medium">{tenant.rentAmount} TND</td>
                        <td className="py-4">{getStatusBadge(tenant.paymentStatus)}</td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            {tenant.paymentStatus === "overdue" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsPaidMutation.mutate(tenant.id)}
                                disabled={markAsPaidMutation.isPending}
                                data-testid={`button-mark-paid-${tenant.id}`}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingTenant(tenant)}
                              data-testid={`button-edit-tenant-${tenant.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(tenant)}
                              data-testid={`button-delete-tenant-${tenant.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Tenant Dialog */}
        <Dialog open={isAddDialogOpen || !!editingTenant} onOpenChange={() => {
          setIsAddDialogOpen(false);
          setEditingTenant(null);
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingTenant ? "Edit Tenant" : "Add New Tenant"}
              </DialogTitle>
            </DialogHeader>
            <TenantForm
              tenant={editingTenant}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}