// src/pages/profile/ProfileView.tsx

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Building2, Calendar, CheckCircle, XCircle, Edit } from "lucide-react";

interface ProfileViewProps {
  onEdit: () => void;
}

const InfoRow = ({ icon: Icon, label, value }: { 
  icon: React.ElementType; 
  label: string; 
  value: React.ReactNode 
}) => (
  <div className="flex items-start py-4 border-b last:border-b-0">
    <div className="flex items-center min-w-[200px]">
      <Icon className="h-4 w-4 text-muted-foreground mr-2" />
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
    <div className="flex-1 text-sm text-foreground font-medium">{value || "—"}</div>
  </div>
);

export function ProfileView({ onEdit }: ProfileViewProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Profile...</CardTitle>
          <CardDescription>Fetching your information from the server.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Profile</CardTitle>
          <CardDescription>
            Unable to load your profile information. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Your Profile Information
            </CardTitle>
            <CardDescription className="mt-2">
              View your account details and verification status
            </CardDescription>
          </div>
          <Button onClick={onEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
                  {/* Account Status */}
        <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-medium">Account Status</p>
            <p className="text-xs text-muted-foreground">
              Your email verification status
            </p>
          </div>
          {user.isVerified ?? false ? (
            <Badge variant="default" className="bg-green-500 gap-1">
              <CheckCircle className="h-3 w-3" />
              Verified
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              Not Verified
            </Badge>
          )}
        </div>

        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="border rounded-lg">
            <InfoRow 
              icon={User} 
              label="First Name" 
              value={user.firstName} 
            />
            <InfoRow 
              icon={User} 
              label="Last Name" 
              value={user.lastName} 
            />
            <InfoRow 
              icon={Mail} 
              label="Email Address" 
              value={user.email} 
            />
            <InfoRow 
              icon={Building2} 
              label="Company Name" 
              value={user.companyName || "Not specified"} 
            />
          </div>
        </div>

        {/* Account Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="border rounded-lg">
            <InfoRow 
              icon={Calendar} 
              label="Member Since" 
              value={
                user.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : "—"
              } 
            />
            <InfoRow 
              icon={User} 
              label="User ID" 
              value={<code className="text-xs bg-muted px-2 py-1 rounded">{user.id}</code>} 
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/20">
        <p className="text-xs text-muted-foreground">
          Need to make changes? Click the "Edit Profile" button above to update your information.
        </p>
      </CardFooter>
    </Card>
  );
}