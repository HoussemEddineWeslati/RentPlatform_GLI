//src\pages\landlords\[id]\properties.tsx :
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Property } from "@/types/schema";
import { PlusCircle, Trash2, Edit, Search, ArrowLeft, Building, MapPin, Home as HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PropertyForm } from "@/components/property-form";
import { useToast } from "@/hooks/use-toast";
import { Link, useRoute } from "wouter";

export default function LandlordPropertiesPaPage() {
  const [, params] = useRoute("/landlords/:id/properties");
  const landlordId = params?.id;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/landlords", landlordId, "properties"],
    queryFn: () => apiRequest("GET", `/api/landlords/${landlordId}/properties`),
    enabled: !!landlordId,
  });

   const { data: landlord } = useQuery({
    queryKey: ["/api/landlords", landlordId],
    queryFn: () => apiRequest("GET", `/api/landlords/${landlordId}`),
    enabled: !!landlordId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/properties/${selectedProperty?.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/landlords", landlordId, "properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/landlords", landlordId] });
      toast({ title: "Property Deleted" });
      setIsAlertOpen(false);
      setSelectedProperty(null);
    },
    onError: (error: any) => toast({ title: "Deletion Failed", description: error.message, variant: "destructive" }),
  });

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setIsFormOpen(true);
  };

  const handleDelete = (property: Property) => {
    setSelectedProperty(property);
    setIsAlertOpen(true);
  };
  
  const filteredProperties = useMemo(() =>
    properties.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase())
    ), [properties, searchTerm]);

  const getPropertyTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "apartment": return <Building className="h-5 w-5 text-primary" />;
      case "house": return <HomeIcon className="h-5 w-5 text-primary" />;
      case "villa": return <HomeIcon className="h-5 w-5 text-primary" />;
      default: return <Building className="h-5 w-5 text-primary" />;
    }
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
              <h1 className="text-3xl font-bold tracking-tight">Properties for {landlord?.name}</h1>
              <p className="text-muted-foreground">Manage all properties for this landlord.</p>
          </div>
          <Button variant="slate" onClick={() => { setSelectedProperty(null); setIsFormOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Property
          </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? <p>Loading properties...</p> :
      filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{properties.length === 0 ? "No Properties Yet" : "No Matching Properties"}</h3>
            <p className="text-muted-foreground mb-4">{properties.length === 0 ? "Add the first property for this landlord." : "Try a different search term."}</p>
            {properties.length === 0 && (
                <Button onClick={() => setIsFormOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add First Property</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
                <Card key={property.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    <CardContent className="p-6 flex-grow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-2 rounded-full">{getPropertyTypeIcon(property.type)}</div>
                                <div>
                                    <Link href={`/landlords/${landlordId}/properties/${property.id}`}>
                                        <a className="font-semibold text-lg hover:underline">{property.name}</a>
                                    </Link>
                                    <Badge variant="secondary">{property.type}</Badge>
                                </div>
                            </div>
                            <div className="flex">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(property)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(property)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{property.address}</div>
                            <p className="pt-2">{property.description}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProperty ? "Edit Property" : "Add New Property"}</DialogTitle>
             <DialogDescription>Fill in the details for the property.</DialogDescription>
          </DialogHeader>
          <PropertyForm property={selectedProperty} landlordId={landlordId!} onSuccess={() => setIsFormOpen(false)} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the property and its tenants. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? "Deleting..." : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}