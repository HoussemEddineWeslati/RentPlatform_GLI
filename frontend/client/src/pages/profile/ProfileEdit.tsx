// src/pages/profile/ProfileEdit.tsx

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  companyName: z.string().optional(),
  email: z.string().email("Invalid email address"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditProps {
  onFinished: () => void;
}

export function ProfileEdit({ onFinished }: ProfileEditProps) {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      email: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        companyName: user.companyName ?? "",
        email: user.email || "",
      });
    }
  }, [user, form]);

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) => 
      apiRequest("PATCH", "/api/auth/profile", data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      const emailChanged = response.data?.email !== user?.email;
      
      toast({
        title: "Profile Updated",
        description: emailChanged 
          ? "Your profile has been updated. Please verify your new email address."
          : "Your profile information has been updated successfully.",
      });
      
      onFinished();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>Fetching your profile information.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const emailChanged = form.watch("email") !== user?.email;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Edit Your Profile
          </CardTitle>
          <CardDescription>
            Update your personal information. Changes will be saved immediately.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {emailChanged && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Changing your email address will require re-verification. 
                You'll receive a verification code at your new email address.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                {...form.register("firstName")}
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...form.register("lastName")}
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name (Optional)</Label>
            <Input
              id="companyName"
              placeholder="Your Company Inc."
              {...form.register("companyName")}
            />
          </div>
        </CardContent>

        <CardFooter className="border-t px-6 py-4 flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onFinished}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={updateMutation.isPending || !form.formState.isDirty}
          >
            {updateMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}