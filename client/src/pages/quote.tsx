import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calculator, 
  Shield, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  ArrowRight,
  Clock,
  Headphones,
  Check,
  Info
} from "lucide-react";

interface QuoteFormData {
  rentAmount: string;
  riskFactor: "low" | "medium" | "high";
  coverageLevel: "basic" | "standard" | "premium";
}

export default function Quote() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [calculatedPremium, setCalculatedPremium] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

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

  const form = useForm<QuoteFormData>({
    defaultValues: {
      rentAmount: "",
      riskFactor: "medium",
      coverageLevel: "standard",
    },
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (data: QuoteFormData) => {
      const response = await apiRequest("POST", "/api/quotes", {
        rentAmount: data.rentAmount,
        riskFactor: data.riskFactor,
        coverageLevel: data.coverageLevel,
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setCalculatedPremium(parseFloat(data.monthlyPremium));
      setShowResults(true);
      toast({
        title: "Quote calculated",
        description: "Your premium has been calculated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to calculate quote",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuoteFormData) => {
    createQuoteMutation.mutate(data);
  };

  const watchedValues = form.watch();

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low":
        return <ShieldCheck className="text-green-500 text-xl" />;
      case "medium":
        return <Shield className="text-orange-500 text-xl" />;
      case "high":
        return <AlertTriangle className="text-red-500 text-xl" />;
      default:
        return <Shield className="text-orange-500 text-xl" />;
    }
  };

  const getRiskDescription = (risk: string) => {
    switch (risk) {
      case "low":
        return "Excellent credit";
      case "medium":
        return "Good credit";
      case "high":
        return "Fair credit";
      default:
        return "Good credit";
    }
  };

  const getCoverageDescription = (coverage: string) => {
    switch (coverage) {
      case "basic":
        return {
          title: "Basic Coverage",
          description: "Up to 3 months rent coverage",
          features: ["• Unpaid rent protection"]
        };
      case "standard":
        return {
          title: "Standard Coverage",
          description: "Up to 6 months rent coverage",
          features: ["• Unpaid rent protection", "• Legal expenses"]
        };
      case "premium":
        return {
          title: "Premium Coverage",
          description: "Up to 12 months rent coverage",
          features: ["• Unpaid rent protection", "• Legal expenses", "• Property damage"]
        };
      default:
        return {
          title: "Standard Coverage",
          description: "Up to 6 months rent coverage",
          features: ["• Unpaid rent protection", "• Legal expenses"]
        };
    }
  };

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded-lg"></div>
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const coverageInfo = getCoverageDescription(watchedValues.coverageLevel);

  return (
    <div className="pt-16 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-quote-title">
            GLI Premium Calculator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Calculate your monthly GLI premium based on rent amount, tenant risk profile, and desired coverage level.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Calculate Your Premium</h2>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Rent Amount */}
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">
                    Monthly Rent Amount (TND)
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter rent amount"
                      className="text-lg font-medium"
                      data-testid="input-rent-amount"
                      {...form.register("rentAmount", { required: true })}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-muted-foreground text-sm">TND</span>
                    </div>
                  </div>
                </div>

                {/* Risk Profile */}
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">
                    Tenant Risk Profile
                  </Label>
                  <RadioGroup
                    value={watchedValues.riskFactor}
                    onValueChange={(value) => form.setValue("riskFactor", value as any)}
                    className="grid grid-cols-3 gap-3"
                  >
                    <div>
                      <RadioGroupItem value="low" id="low" className="sr-only" />
                      <Label
                        htmlFor="low"
                        className={`p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors text-center block ${
                          watchedValues.riskFactor === "low" ? "border-primary bg-blue-50" : "border-border"
                        }`}
                        data-testid="radio-risk-low"
                      >
                        <div className="text-green-500 text-xl mb-2 flex justify-center">
                          <ShieldCheck />
                        </div>
                        <div className="font-medium text-sm">Low Risk</div>
                        <div className="text-xs text-muted-foreground">Excellent credit</div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="medium" id="medium" className="sr-only" />
                      <Label
                        htmlFor="medium"
                        className={`p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors text-center block ${
                          watchedValues.riskFactor === "medium" ? "border-primary bg-blue-50" : "border-border"
                        }`}
                        data-testid="radio-risk-medium"
                      >
                        <div className="text-orange-500 text-xl mb-2 flex justify-center">
                          <Shield />
                        </div>
                        <div className="font-medium text-sm">Medium Risk</div>
                        <div className="text-xs text-muted-foreground">Good credit</div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="high" id="high" className="sr-only" />
                      <Label
                        htmlFor="high"
                        className={`p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors text-center block ${
                          watchedValues.riskFactor === "high" ? "border-primary bg-blue-50" : "border-border"
                        }`}
                        data-testid="radio-risk-high"
                      >
                        <div className="text-red-500 text-xl mb-2 flex justify-center">
                          <AlertTriangle />
                        </div>
                        <div className="font-medium text-sm">High Risk</div>
                        <div className="text-xs text-muted-foreground">Fair credit</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Coverage Level */}
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">
                    Coverage Level
                  </Label>
                  <RadioGroup
                    value={watchedValues.coverageLevel}
                    onValueChange={(value) => form.setValue("coverageLevel", value as any)}
                    className="space-y-3"
                  >
                    <div>
                      <RadioGroupItem value="basic" id="basic" className="sr-only" />
                      <Label
                        htmlFor="basic"
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors ${
                          watchedValues.coverageLevel === "basic" ? "border-primary bg-blue-50" : "border-border"
                        }`}
                        data-testid="radio-coverage-basic"
                      >
                        <div className="flex-1">
                          <div className="font-medium">Basic Coverage</div>
                          <div className="text-sm text-muted-foreground">Up to 3 months rent coverage</div>
                          <div className="text-xs text-muted-foreground mt-1">• Unpaid rent protection</div>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="standard" id="standard" className="sr-only" />
                      <Label
                        htmlFor="standard"
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors ${
                          watchedValues.coverageLevel === "standard" ? "border-primary bg-blue-50" : "border-border"
                        }`}
                        data-testid="radio-coverage-standard"
                      >
                        <div className="flex-1">
                          <div className="font-medium">Standard Coverage</div>
                          <div className="text-sm text-muted-foreground">Up to 6 months rent coverage</div>
                          <div className="text-xs text-muted-foreground mt-1">• Unpaid rent protection • Legal expenses</div>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="premium" id="premium" className="sr-only" />
                      <Label
                        htmlFor="premium"
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors ${
                          watchedValues.coverageLevel === "premium" ? "border-primary bg-blue-50" : "border-border"
                        }`}
                        data-testid="radio-coverage-premium"
                      >
                        <div className="flex-1">
                          <div className="font-medium">Premium Coverage</div>
                          <div className="text-sm text-muted-foreground">Up to 12 months rent coverage</div>
                          <div className="text-xs text-muted-foreground mt-1">• Unpaid rent protection • Legal expenses • Property damage</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  type="submit"
                  className="w-full py-3"
                  disabled={createQuoteMutation.isPending || !watchedValues.rentAmount}
                  data-testid="button-calculate-quote"
                >
                  {createQuoteMutation.isPending ? (
                    "Calculating..."
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate Premium
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quote Results */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Your Quote</h2>
              
              {showResults && calculatedPremium !== null ? (
                <div className="space-y-6">
                  {/* Premium Display */}
                  <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
                    <CardContent className="p-6 text-center">
                      <div className="text-sm opacity-90 mb-2">Your estimated monthly premium</div>
                      <div className="text-4xl font-bold mb-2" data-testid="text-calculated-premium">
                        {calculatedPremium} TND
                      </div>
                      <div className="text-sm opacity-90">per month</div>
                    </CardContent>
                  </Card>

                  {/* Quote Breakdown */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Quote Breakdown</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Premium:</span>
                        <span className="font-medium">
                          {Math.round(parseFloat(watchedValues.rentAmount || "0") * 0.03)} TND
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risk Adjustment:</span>
                        <span className="font-medium text-orange-600">
                          +{Math.round(parseFloat(watchedValues.rentAmount || "0") * 0.03 * 0.1)} TND
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coverage Multiplier:</span>
                        <span className="font-medium text-accent">
                          +{Math.round(parseFloat(watchedValues.rentAmount || "0") * 0.03 * 0.1)} TND
                        </span>
                      </div>
                      <div className="border-t border-border pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Monthly Premium:</span>
                          <span className="text-primary">{calculatedPremium} TND</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coverage Summary */}
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-foreground mb-3">Your Coverage Includes:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center">
                          <Check className="text-accent mr-2 h-4 w-4" />
                          {coverageInfo.description}
                        </li>
                        <li className="flex items-center">
                          <Check className="text-accent mr-2 h-4 w-4" />
                          Legal expenses up to 2,000 TND
                        </li>
                        <li className="flex items-center">
                          <Check className="text-accent mr-2 h-4 w-4" />
                          24/7 claim support
                        </li>
                        <li className="flex items-center">
                          <Check className="text-accent mr-2 h-4 w-4" />
                          Fast claim processing
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button className="w-full bg-accent text-accent-foreground" data-testid="button-download-quote">
                      <Download className="mr-2 h-4 w-4" />
                      Download Quote (PDF)
                    </Button>
                  </div>

                  {/* Disclaimer */}
                  <div className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                    <Info className="inline mr-1 h-3 w-3" />
                    This is an estimated quote. Final premium may vary based on property inspection and tenant verification. Quote valid for 30 days.
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Ready to Calculate?</h3>
                  <p className="text-muted-foreground">Fill in the form on the left to get your personalized GLI premium quote.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="text-primary text-2xl" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Quick Processing</h3>
              <p className="text-sm text-muted-foreground">Get your quote instantly and activate coverage within 24 hours.</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="text-accent text-2xl" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Comprehensive Coverage</h3>
              <p className="text-sm text-muted-foreground">Full protection against unpaid rent and associated legal costs.</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Headphones className="text-orange-500 text-2xl" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Expert Support</h3>
              <p className="text-sm text-muted-foreground">Dedicated support team to help you through the entire claims process.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
