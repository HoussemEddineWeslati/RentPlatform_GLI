// client/src/pages/properties/index.tsx
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
import { PropertyForm } from "@/components/property-form";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { apiRequest } from "@/lib/api";
import { 
  Building, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  MapPin,
  Home
} from "lucide-react";

// 👇 FIX APPLIED HERE
interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  description: string | null;
  userId: string;
}

export default function Properties() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  const { data: properties = [], isLoading: propertiesLoading, error: propertiesError } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: isAuthenticated,
  });
  // Handle query errors
  useEffect(() => {
    if (propertiesError && isUnauthorizedError(propertiesError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        navigate("/login");
      }, 500);
    }
  }, [propertiesError, toast, navigate]);
  const deletePropertyMutation = useMutation({
    mutationFn: (propertyId: string) => apiRequest("DELETE", `/api/properties/${propertyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property deleted",
        description: "The property has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete property",
         description: error.message,
        variant: "destructive",
      });
    },
  });
  if (isLoading || propertiesLoading) {
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

  const filteredProperties = properties.filter(property => 
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleDelete = (property: Property) => {
    if (window.confirm(`Are you sure you want to delete ${property.name}?`)) {
      deletePropertyMutation.mutate(property.id);
    }
  };

  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
    setEditingProperty(null);
  };
  const handleFormCancel = () => {
    setIsAddDialogOpen(false);
    setEditingProperty(null);
  };
  const getPropertyTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "apartment":
        return <Building className="h-5 w-5" />;
      case "house":
        return <Home className="h-5 w-5" />;
      default:
        return <Building className="h-5 w-5" />;
    }
  };
  const getPropertyTypeBadge = (type: string) => {
    const colors = {
      apartment: "bg-blue-100 text-blue-800",
      house: "bg-green-100 text-green-800", 
      studio: "bg-purple-100 text-purple-800"
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="pt-16 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-properties-title">
              Property Management
            </h1>
            <p className="text-muted-foreground">Manage your rental properties</p>
          </div>
          <Button 
            className="mt-4 sm:mt-0"
            onClick={() => setIsAddDialogOpen(true)}
            data-testid="button-add-property"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Property
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-properties"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {properties.length === 0 ? "No properties yet" : "No properties found"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {properties.length === 0 
                    ? "Start by adding your first property to manage tenants."
                    : "Try adjusting your search criteria."}
                </p>
                {properties.length === 0 && (
                  <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-property">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Property
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-primary/10 rounded-full p-2 mr-3">
                        {getPropertyTypeIcon(property.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{property.name}</h3>
                        {getPropertyTypeBadge(property.type)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProperty(property)}
                        data-testid={`button-edit-property-${property.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(property)}
                        data-testid={`button-delete-property-${property.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {/* 👇 FIX APPLIED HERE */}
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{property.address}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2 truncate" title={property.description ?? ''}>
                      {property.description || "No description provided."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Property Dialog */}
        <Dialog open={isAddDialogOpen || !!editingProperty} onOpenChange={() => {
          setIsAddDialogOpen(false);
          setEditingProperty(null);
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingProperty ? "Edit Property" : "Add New Property"}
              </DialogTitle>
            </DialogHeader>
            <PropertyForm
              property={editingProperty}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}