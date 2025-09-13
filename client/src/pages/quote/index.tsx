import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertQuoteSchema, type InsertQuote } from "@shared/schema";
import { Calculator, Shield, TrendingUp, AlertCircle } from "lucide-react";
import { z } from "zod";

const quoteFormSchema = insertQuoteSchema.extend({
  rentAmount: z.string().min(1, "Rent amount is required"),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

export default function Quote() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [calculatedQuote, setCalculatedQuote] = useState<any>(null);

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      rentAmount: "",
      riskFactor: "medium",
      coverageLevel: "standard",
    },
  });

  const calculateQuoteMutation = useMutation({
    mutationFn: (data: QuoteFormData) => apiRequest("POST", "/api/quotes", data),
    onSuccess: (quote) => {
      setCalculatedQuote(quote);
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Quote calculated",
        description: "Your GLI insurance quote has been generated.",
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
    calculateQuoteMutation.mutate(data);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "high": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getRiskDescription = (risk: string) => {
    switch (risk) {
      case "low": return "Excellent tenant profile with stable income";
      case "medium": return "Good tenant profile with acceptable risk";
      case "high": return "Higher risk tenant requiring closer monitoring";
      default: return "";
    }
  };

  return (
    <div className="pt-16 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-quote-title">
            GLI Insurance Quote Calculator
          </h1>
          <p className="text-muted-foreground">
            Calculate your monthly premium for guaranteed rent protection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quote Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Calculate Your Quote
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="rentAmount">Monthly Rent Amount (TND)</Label>
                  <Input
                    id="rentAmount"
                    type="number"
                    placeholder="Enter monthly rent amount"
                    data-testid="input-rent-amount"
                    {...form.register("rentAmount")}
                  />
                  {form.formState.errors.rentAmount && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.rentAmount.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="riskFactor">Tenant Risk Assessment</Label>
                  <Select
                    onValueChange={(value) => form.setValue("riskFactor", value)}
                    defaultValue={form.getValues("riskFactor")}
                  >
                    <SelectTrigger data-testid="select-risk-factor">
                      <SelectValue placeholder="Select tenant risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className={`text-sm mt-1 ${getRiskColor(form.watch("riskFactor"))}`}>
                    {getRiskDescription(form.watch("riskFactor"))}
                  </p>
                </div>

                <div>
                  <Label htmlFor="coverageLevel">Coverage Level</Label>
                  <Select
                    onValueChange={(value) => form.setValue("coverageLevel", value)}
                    defaultValue={form.getValues("coverageLevel")}
                  >
                    <SelectTrigger data-testid="select-coverage-level">
                      <SelectValue placeholder="Select coverage level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (6 months coverage)</SelectItem>
                      <SelectItem value="standard">Standard (12 months coverage)</SelectItem>
                      <SelectItem value="premium">Premium (18 months coverage)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={calculateQuoteMutation.isPending}
                  data-testid="button-calculate-quote"
                >
                  {calculateQuoteMutation.isPending ? "Calculating..." : "Calculate Quote"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quote Result */}
          <div className="space-y-6">
            {calculatedQuote ? (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Shield className="mr-2 h-5 w-5" />
                    Your GLI Quote
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2" data-testid="text-monthly-premium">
                      {calculatedQuote.monthlyPremium} TND
                    </div>
                    <p className="text-muted-foreground">Monthly Premium</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Rent Amount</p>
                      <p className="font-medium">{calculatedQuote.rentAmount} TND</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Coverage Level</p>
                      <p className="font-medium capitalize">{calculatedQuote.coverageLevel}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Risk Level</p>
                      <p className={`font-medium capitalize ${getRiskColor(calculatedQuote.riskFactor)}`}>
                        {calculatedQuote.riskFactor}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Premium Rate</p>
                      <p className="font-medium">{calculatedQuote.premiumRate}%</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full" data-testid="button-get-quote">
                      Get This Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calculator className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Ready to Calculate?
                  </h3>
                  <p className="text-muted-foreground">
                    Fill out the form to get your personalized GLI insurance quote
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Coverage Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Coverage Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start">
                  <Shield className="text-green-600 mr-3 mt-1 h-4 w-4" />
                  <div>
                    <p className="font-medium">Guaranteed Rent Payments</p>
                    <p className="text-sm text-muted-foreground">Full rent coverage during tenant defaults</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="text-blue-600 mr-3 mt-1 h-4 w-4" />
                  <div>
                    <p className="font-medium">Legal Protection</p>
                    <p className="text-sm text-muted-foreground">Legal costs for eviction proceedings</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <TrendingUp className="text-purple-600 mr-3 mt-1 h-4 w-4" />
                  <div>
                    <p className="font-medium">Property Damage Cover</p>
                    <p className="text-sm text-muted-foreground">Protection against tenant-caused damage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}