//src\pages\landlords\[id]\index.tsx :
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { apiRequest } from "@/lib/api";
import { Landlord } from "@/types/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Mail, Phone, ArrowLeft } from "lucide-react";

export default function LandlordDetailPage() {
  const [, params] = useRoute("/landlords/:id");
  const landlordId = params?.id;

  const { data: landlord, isLoading, error } = useQuery<Landlord>({
    queryKey: ["/api/landlords", landlordId],
    queryFn: () => apiRequest("GET", `/api/landlords/${landlordId}`),
    enabled: !!landlordId,
  });

  if (isLoading) return <div className="p-8">Loading landlord details...</div>;
  if (error) return <div className="p-8 text-destructive">Error loading landlord.</div>;
  if (!landlord) return <div className="p-8">Landlord not found.</div>;

  return (
    <div className="container mx-auto pt-24 pb-10 px-4">
      <Link href="/landlords">
        <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Landlords
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{landlord.name}</CardTitle>
          <div className="text-muted-foreground flex items-center pt-2">
            <Mail className="mr-2 h-4 w-4" /> {landlord.email}
            <span className="mx-4">|</span>
            <Phone className="mr-2 h-4 w-4" /> {landlord.phone}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-6 flex space-x-4">
            <Link href={`/landlords/${landlordId}/properties`}>
              <Button>
                <Building className="mr-2 h-4 w-4" />
                View Properties ({landlord.propertyCount || 0})
              </Button>
            </Link>
             <Link href={`/landlords/${landlordId}/tenants`}>
               <Button variant="secondary">
                 <Users className="mr-2 h-4 w-4" />
                 View Tenants
               </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}