// client/src/pages/signup/index.tsx
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { insertUserSchema } from "../../types/schema";
import { z } from "zod";
import { UserPlus } from "lucide-react";

export default function Signup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Extend the shared insertUserSchema with form-only fields + companyName
  const signupFormSchema = insertUserSchema
    .extend({
      companyName: z.string().min(1, "Company name is required"),
      confirmPassword: z.string().min(6),
      terms: z
        .boolean()
        .refine((val) => val === true, { message: "You must accept the terms" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  type SignupFormData = z.infer<typeof signupFormSchema>;

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      terms: false,
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: SignupFormData) => {
      // remove confirmPassword and terms before sending
      const { confirmPassword, terms, ...userData } = data as any;
      return apiRequest("POST", "/api/auth/signup", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Signup successful",
        description: "Please check your email for the verification code.",
      });
      // navigate to verify page with email param so user can enter OTP
      const email = form.getValues().email;
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description:
          error?.data?.message || error?.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <UserPlus className="text-primary text-4xl mb-4 mx-auto" />
              <h2 className="text-3xl font-bold text-foreground">
                Create your account
              </h2>
              <p className="mt-2 text-muted-foreground">
                Start protecting your rental income today
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-foreground"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      data-testid="input-first-name"
                      {...form.register("firstName")}
                      className="mt-1"
                    />
                    {form.formState.errors.firstName && (
                      <p className="mt-1 text-sm text-destructive">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-foreground"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      data-testid="input-last-name"
                      {...form.register("lastName")}
                      className="mt-1"
                    />
                    {form.formState.errors.lastName && (
                      <p className="mt-1 text-sm text-destructive">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-foreground"
                  >
                    Company name
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Company or organization name"
                    data-testid="input-company-name"
                    {...form.register("companyName")}
                    className="mt-1"
                  />
                  {form.formState.errors.companyName && (
                    <p className="mt-1 text-sm text-destructive">
                      {form.formState.errors.companyName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground"
                  >
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    data-testid="input-email"
                    {...form.register("email")}
                    className="mt-1"
                  />
                  {form.formState.errors.email && (
                    <p className="mt-1 text-sm text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="block text-sm font-medium text-foreground"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    data-testid="input-password"
                    {...form.register("password")}
                    className="mt-1"
                  />
                  {form.formState.errors.password && (
                    <p className="mt-1 text-sm text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-foreground"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    data-testid="input-confirm-password"
                    {...form.register("confirmPassword")}
                    className="mt-1"
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-destructive">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <Checkbox
                  id="terms"
                  checked={form.watch("terms") || false}
                  onCheckedChange={(checked) =>
                    form.setValue("terms", checked === true)
                  }
                  data-testid="checkbox-terms"
                />
                <Label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-muted-foreground"
                >
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:opacity-80">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:opacity-80">
                    Privacy Policy
                  </a>
                </Label>
              </div>
              {form.formState.errors.terms && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.terms.message}
                </p>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full py-3"
                  disabled={signupMutation.isPending}
                  data-testid="button-signup"
                >
                  {signupMutation.isPending
                    ? "Creating Account..."
                    : "Create Account"}
                </Button>
              </div>

              <div className="text-center">
                <span className="text-muted-foreground">
                  Already have an account?
                </span>
                <Link href="/login" data-testid="link-login-from-signup">
                  <Button variant="link" className="font-medium ml-1">
                    Sign in here
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
