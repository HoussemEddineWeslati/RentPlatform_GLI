// client/src/pages/forgot-password/index.tsx
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const { toast } = useToast();
  const { register, handleSubmit } = useForm<{ email: string }>();
  const mutation = useMutation({
    mutationFn: (data: { email: string }) => apiRequest("POST", "/api/auth/forgot-password", data),
    onSuccess: (res) => {
      toast({ title: "Check your email", description: res?.message ?? "If an account exists, the reset link has been sent." });
    },
    onError: (err: any) => {
      toast({ title: "Failed", description: err?.data?.message || err?.message || "Failed to send.", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8">
          <h2 className="text-2xl font-semibold mb-2">Reset your password</h2>
          <p className="text-sm text-muted-foreground mb-4">Enter the email associated with your account.</p>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <Input {...register("email", { required: true })} placeholder="you@example.com" />
            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Sending..." : "Send reset link"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
