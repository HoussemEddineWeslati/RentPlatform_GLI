// src/pages/verify/index.tsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import PinInput from "@/components/otp/PinInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types/schema";

// Define the shape of the successful API response from the backend
interface AuthResponse {
  success: boolean;
  data: User;
  message?: string;
}

export default function VerifyPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Get the query client instance
  const query = new URLSearchParams(window.location.search);
  const emailFromQuery = query.get("email") ?? "";

  const [email] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState<number | null>(null);

  useEffect(() => {
    // Redirect if the page is accessed without an email in the URL
    if (!emailFromQuery) {
      toast({
        title: "Missing Information",
        description: "Email is required for verification. Please try logging in again.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [emailFromQuery, navigate, toast]);

  async function handleVerify() {
    if (otp.length < 6) {
      return toast({
        title: "Invalid Code",
        description: "Please enter the complete 6-digit code.",
        variant: "destructive",
      });
    }
    setIsSubmitting(true);
    try {
      const response = await apiRequest<AuthResponse>("POST", "/api/auth/verify-email", { email, otp });

      toast({ title: "Success!", description: "Your email has been verified." });

      // FIX: Manually update the user query cache with the response from the verify endpoint.
      // This immediately updates the application's auth state.
      queryClient.setQueryData(["/api/auth/user"], response);
      
      // Invalidate the query to ensure the data is perfectly fresh, though setQueryData provides an optimistic update.
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      // Now that the auth state is updated, we can safely navigate to the dashboard.
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err?.data?.message || err?.message || "Invalid or expired code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!email) {
      return toast({
        title: "Missing Email",
        description: "Could not find an email to resend the code to.",
        variant: "destructive",
      });
    }
    try {
      await apiRequest("POST", "/api/auth/resend-otp", { email });
      toast({ title: "OTP Sent", description: "A new code has been sent to your email." });
      
      // Start a frontend cooldown timer (the backend enforces the real cooldown)
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((current) => {
          if (current === null || current <= 1) {
            clearInterval(interval);
            return null;
          }
          return current - 1;
        });
      }, 1000);
    } catch (err: any) {
      toast({
        title: "Resend Failed",
        description: err?.data?.message || err?.message || "Could not resend the OTP.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted pt-16">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8">
          <h2 className="text-2xl font-semibold mb-2">Verify Your Email</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </p>
          <div className="mb-4">
            <Label>Verification code</Label>
            <div className="mt-2">
              <PinInput value={otp} onChange={setOtp} />
            </div>
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleVerify} disabled={isSubmitting || otp.length < 6}>
              {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
            <Button variant="ghost" onClick={handleResend} disabled={!!resendCooldown}>
              {resendCooldown ? `Resend (${resendCooldown}s)` : "Resend code"}
            </Button>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or click "Resend code".
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
