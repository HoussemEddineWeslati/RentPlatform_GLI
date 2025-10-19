// src/pages/reset-password/[token].tsx
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type FormValues = {
  password: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const params = useParams<{ token?: string }>();
  const [, navigate] = useLocation();
  const tokenFromPath = params.token || "";
  const { toast } = useToast();
  const { register, handleSubmit } = useForm<FormValues>();

  async function onSubmit(data: FormValues) {
    if (data.password.length < 6) {
      return toast({
        title: "Weak password",
        description: "Use at least 6 characters",
        variant: "destructive",
      });
    }
    if (data.password !== data.confirmPassword) {
      return toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
    }
    if (!tokenFromPath) {
      return toast({
        title: "Invalid link",
        description: "Missing or invalid reset token",
        variant: "destructive",
      });
    }

    try {
      await apiRequest(
        "POST",
        `/api/auth/reset-password/${encodeURIComponent(tokenFromPath)}`,
        { password: data.password }
      );
      toast({
        title: "Password reset",
        description: "You can now log in with your new password.",
      });
      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Reset failed",
        description:
          err?.data?.message || err?.message || "Invalid or expired token",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 bg-muted">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8">
          <h2 className="text-2xl font-semibold mb-2">Choose a new password</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Enter a new password for your account.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                {...register("password", { required: true })}
                type="password"
                placeholder="New password"
                data-testid="input-new-password"
              />
            </div>

            <div>
              <Input
                {...register("confirmPassword", { required: true })}
                type="password"
                placeholder="Confirm password"
                data-testid="input-confirm-password"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Reset password</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
