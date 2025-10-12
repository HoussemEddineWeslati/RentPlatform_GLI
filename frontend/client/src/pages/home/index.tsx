//src/pages/home/index.tsx :
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Calculator, BarChart3, Check, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/use-auth";

// ✅ import the background image
import cityscapeWallpaper from "@assets/generated_images/Dark_cityscape_wallpaper_background_aa84b263.png";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <div
        className="relative text-white min-h-screen"
        style={{
          backgroundImage: `url(${cityscapeWallpaper})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-blue-600/80 to-blue-700/80"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 pt-32">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Protect Your Rent with{" "}
                <span className="text-blue-200">GLI Insurance</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-blue-100">
                Simplify and automate your rental income protection. Manage tenants, track payments, and calculate premiums effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link href="/dashboard" data-testid="link-go-to-dashboard">
                    <Button className="bg-white text-primary px-8 py-4 text-lg hover:bg-gray-50">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup" data-testid="link-get-started">
                      <Button className="bg-white text-primary px-8 py-4 text-lg hover:bg-gray-50">
                        Get Started Free
                      </Button>
                    </Link>
                    <Link href="/login" data-testid="link-login-hero">
                      <Button
                        variant="outline"
                        className="border-2 border-white text-white px-8 py-4 text-lg hover:bg-white hover:text-primary"
                      >
                        Login
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-8 flex items-center space-x-6 text-blue-200">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  <span>Free plan available</span>
                </div>
                <div className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  <span>Professional insurance</span>
                </div>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              {/* Dashboard preview */}
              <div className="bg-white rounded-xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="bg-primary h-8 rounded mb-3"></div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-green-100 h-16 rounded flex items-center justify-center">
                      <Users className="text-green-600 text-2xl" />
                    </div>
                    <div className="bg-orange-100 h-16 rounded flex items-center justify-center">
                      <Shield className="text-orange-600 text-2xl" />
                    </div>
                    <div className="bg-blue-100 h-16 rounded flex items-center justify-center">
                      <BarChart3 className="text-blue-600 text-2xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-3 rounded"></div>
                    <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                    <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> {/* End Hero Section */}

      {/* Features Section */}
      <div className="bg-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything you need to manage rentals
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From tenant management to premium calculations, GLI Pro provides all the tools landlords need to protect their rental income.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-200 transform hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Users className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Tenant Management
                </h3>
                <p className="text-muted-foreground mb-4">
                  Add, edit, and manage tenants with ease. Track payment status and automatically flag overdue rents.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <Check className="text-accent mr-2 h-4 w-4" />
                    Payment tracking
                  </li>
                  <li className="flex items-center">
                    <Check className="text-accent mr-2 h-4 w-4" />
                    Automated alerts
                  </li>
                  <li className="flex items-center">
                    <Check className="text-accent mr-2 h-4 w-4" />
                    Tenant profiles
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 transform hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Calculator className="text-accent text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Premium Calculator
                </h3>
                <p className="text-muted-foreground mb-4">
                  Calculate GLI monthly premiums instantly based on rent amount, tenant risk, and coverage level.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <Check className="text-accent mr-2 h-4 w-4" />
                    Instant quotes
                  </li>
                  <li className="flex items-center">
                    <Check className="text-accent mr-2 h-4 w-4" />
                    Risk assessment
                  </li>
                  <li className="flex items-center">
                    <Check className="text-accent mr-2 h-4 w-4" />
                    Multiple coverage levels
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 transform hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <BarChart3 className="text-purple-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Dashboard Insights
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get a complete overview of your rental portfolio with key metrics and performance indicators.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <Check className="text-accent mr-2 h-4 w-4" />
                    Revenue tracking
                  </li>
                  <li className="flex items-center">
                    <Check className="text-accent mr-2 h-4 w-4" />
                    Performance metrics
                  </li>
                  <li className="flex items-center">
                    <Check className="text-accent mr-2 h-4 w-4" />
                    Visual reports
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to protect your rental income?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of landlords who trust GLI Pro to manage their properties.
          </p>
          <Link href="/signup" data-testid="link-start-trial">
            <Button className="px-8 py-4 text-lg">Start Free Trial</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
