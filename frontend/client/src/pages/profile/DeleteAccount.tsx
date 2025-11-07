// src/pages/profile/DeleteAccount.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Trash2, Shield } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const deleteSchema = z.object({
  password: z.string().min(1, "Password is required"),
  confirmText: z.string(),
}).refine((data) => data.confirmText === "DELETE", {
  message: 'You must type "DELETE" exactly to confirm',
  path: ["confirmText"],
});

type DeleteFormData = z.infer<typeof deleteSchema>;

export function DeleteAccount() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<DeleteFormData | null>(null);

  const form = useForm<DeleteFormData>({
    resolver: zodResolver(deleteSchema),
    defaultValues: {
      password: "",
      confirmText: "",
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (data: DeleteFormData) => 
      apiRequest("DELETE", "/api/auth/account", data),
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      // Small delay before redirect to allow user to see the toast
      setTimeout(() => navigate("/"), 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete account. Please check your password.",
        variant: "destructive",
      });
      setShowConfirmDialog(false);
    },
  });

  const handleInitialSubmit = (data: DeleteFormData) => {
    setFormData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirmedDelete = () => {
    if (formData) {
      deleteMutation.mutate(formData);
    }
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(handleInitialSubmit)}>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight text-destructive flex items-center gap-2">
              <Trash2 className="h-6 w-6" />
              Delete Account
            </CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Warning Alert */}
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning: This action cannot be undone!</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>Deleting your account will permanently remove:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Your personal profile information</li>
                  <li>All landlords and their data</li>
                  <li>All properties and tenant records</li>
                  <li>All policies and claims</li>
                  <li>All quotes and risk assessments</li>
                  <li>All configuration settings</li>
                </ul>
                <p className="font-semibold mt-3">
                  This data cannot be recovered once deleted.
                </p>
              </AlertDescription>
            </Alert>

            {/* Security Notice */}
            <div className="bg-muted/50 p-4 rounded-lg border flex gap-3">
              <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Security Verification Required</p>
                <p className="text-xs text-muted-foreground">
                  For your protection, we require your password and confirmation text to proceed with account deletion.
                </p>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Confirm Your Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...form.register("password")}
                className={form.formState.errors.password ? "border-destructive" : ""}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Confirmation Text Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmText">
                Type <code className="text-destructive font-bold">DELETE</code> to confirm{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmText"
                type="text"
                placeholder="Type DELETE"
                {...form.register("confirmText")}
                className={form.formState.errors.confirmText ? "border-destructive" : ""}
              />
              {form.formState.errors.confirmText && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.confirmText.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                This confirmation is case-sensitive. You must type exactly: DELETE
              </p>
            </div>
          </CardContent>

          <CardFooter className="border-t bg-muted/20 flex justify-end gap-3">
            <Button 
              type="submit" 
              variant="destructive"
              disabled={deleteMutation.isPending}
              className="gap-2"
            >
              {deleteMutation.isPending ? (
                "Deleting..."
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete My Account
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Final Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p className="font-medium text-foreground">
                This is your last chance to cancel.
              </p>
              <p>
                Once you click "Yes, Delete My Account", your account and all associated data will be
                permanently deleted from our servers. This action is irreversible.
              </p>
              <p className="text-sm">
                You will receive a confirmation email at your registered email address.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowConfirmDialog(false);
                setFormData(null);
              }}
              disabled={deleteMutation.isPending}
            >
              Cancel - Keep My Account
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Yes, Delete My Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}