import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Tenant } from "@/types/schema";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Trash2, Edit, User, Mail, Calendar, CircleDollarSign, Search
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { TenantForm } from "@/components/tenant-form";

// Extend Tenant type to include propertyName, propertyId, and paymentStatus
type TenantWithProperty = Tenant & { 
  propertyName: string; 
  propertyId: string;
  paymentStatus: string;
};

export default function LandlordTenantsPage() {
  const [, params] = useRoute("/landlords/:id/tenants");
  const landlordId = params?.id;

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantWithProperty | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: tenants = [], isLoading } = useQuery<TenantWithProperty[]>({
    queryKey: ["/api/landlords", landlordId, "tenants"],
    queryFn: () => apiRequest("GET", `/api/landlords/${landlordId}/tenants`),
    enabled: !!landlordId,
  });

  const { data: landlord } = useQuery({
    queryKey: ["/api/landlords", landlordId],
    queryFn: () => apiRequest("GET", `/api/landlords/${landlordId}`),
    enabled: !!landlordId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/tenants/${selectedTenant?.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/landlords", landlordId, "tenants"] });
      if (selectedTenant) {
        queryClient.invalidateQueries({ queryKey: ["/api/properties", selectedTenant.propertyId, "tenants"] });
      }
      toast({ title: "Tenant Deleted" });
      setIsAlertOpen(false);
      setSelectedTenant(null);
    },
    onError: (error: any) => toast({ title: "Deletion Failed", description: error.message, variant: "destructive" }),
  });

  const handleEdit = (tenant: TenantWithProperty) => {
    setSelectedTenant(tenant);
    setIsFormOpen(true);
  };

  const handleDelete = (tenant: TenantWithProperty) => {
    setSelectedTenant(tenant);
    setIsAlertOpen(true);
  };

  const filteredTenants = useMemo(() =>
    tenants.filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [tenants, searchTerm]);

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800"
    };
    return <Badge className={variants[status as keyof typeof variants] || "bg-gray-100"}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto pt-24 pb-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="pl-4">
          <Link href={`/landlords/${landlordId}`}>
            <Button variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Tenants of {landlord?.name}</h1>
          <p className="text-muted-foreground">A list of all tenants across all properties.</p>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-4">
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
        </CardContent>
      </Card>

      {isLoading ? <p>Loading tenants...</p> :
      filteredTenants.length === 0 ? (
        <Card>
            <CardContent className="p-12 text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">{tenants.length === 0 ? "This Landlord Has No Tenants" : "No Matching Tenants"}</h3>
                <p className="text-muted-foreground mb-4">{tenants.length === 0 ? "Tenants will appear here once they are added to a property." : "Try a different search."}</p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map(tenant => (
                <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-lg">{tenant.name}</h3>
                                {getStatusBadge(tenant.paymentStatus)}
                            </div>
                            <div className="flex">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(tenant)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(tenant)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <Link href={`/landlords/${landlordId}/properties/${tenant.propertyId}`}>
                                <a className="font-medium text-primary pt-2 hover:underline">{tenant.propertyName}</a>
                            </Link>
                            <div className="flex items-center"><Mail className="h-4 w-4 mr-2" />{tenant.email}</div>
                            <div className="flex items-center"><CircleDollarSign className="h-4 w-4 mr-2" />TND {Number(tenant.rentAmount || 0).toFixed(2)} / month</div>
                            <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" />{new Date(tenant.leaseStart).toLocaleDateString()} - {new Date(tenant.leaseEnd).toLocaleDateString()}</div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedTenant ? "Edit Tenant" : "Add New Tenant"}</DialogTitle></DialogHeader>
          <TenantForm tenant={selectedTenant} propertyId={selectedTenant?.propertyId!} onSuccess={() => setIsFormOpen(false)} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the tenant.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? "Deleting..." : "Continue"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
