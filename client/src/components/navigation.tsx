import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Shield, 
  Home, 
  LayoutDashboard, 
  Users, 
  Calculator, 
  Building,
  Menu,
  X
} from "lucide-react";

export function Navigation() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out.",
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => location === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavItems = () => (
    <>
      {isAuthenticated ? (
        <>
          <Link href="/dashboard" data-testid="link-dashboard">
            <Button
              variant={isActive("/dashboard") ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/properties" data-testid="link-properties">
            <Button
              variant={isActive("/properties") ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Building className="mr-2 h-4 w-4" />
              Properties
            </Button>
          </Link>
          <Link href="/tenants" data-testid="link-tenants">
            <Button
              variant={isActive("/tenants") ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users className="mr-2 h-4 w-4" />
              Tenants
            </Button>
          </Link>
          <Link href="/quote" data-testid="link-quote">
            <Button
              variant={isActive("/quote") ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Quote
            </Button>
          </Link>
        </>
      ) : (
        <Link href="/" data-testid="link-home">
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            className="justify-start"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </Link>
      )}
    </>
  );

  return (
    <nav className="bg-card shadow-sm border-b border-border fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="text-primary text-2xl mr-3" />
              <span className="font-bold text-xl text-foreground">GLI Pro</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavItems />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.firstName}
                </span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  data-testid="button-logout"
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login" data-testid="link-login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup" data-testid="link-signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavItems />
            {isAuthenticated ? (
              <div className="pt-4 border-t border-border mt-4">
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Welcome, {user?.firstName}
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  data-testid="button-mobile-logout"
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            ) : (
              <div className="pt-4 border-t border-border mt-4 space-y-2">
                <Link href="/login" data-testid="link-mobile-login">
                  <Button variant="ghost" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link href="/signup" data-testid="link-mobile-signup">
                  <Button className="w-full justify-start">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
