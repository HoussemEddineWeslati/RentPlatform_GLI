// src/components/navbar/index.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location, navigate] = useLocation();
  const { user: userResponse, isAuthenticated, isLoading } = useAuth();
  
  // Extract the actual user data from the response
  // Handle both formats: direct user object or wrapped in {success, data}
  const user = (userResponse as any)?.data || userResponse;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Track sidebar state for proper navbar positioning
  useEffect(() => {
    const checkSidebarState = () => {
      const saved = localStorage.getItem("sidebar-collapsed");
      setSidebarCollapsed(saved ? JSON.parse(saved) : false);
    };
    checkSidebarState();
    window.addEventListener("storage", checkSidebarState);
    const interval = setInterval(checkSidebarState, 100);
    return () => {
      window.removeEventListener("storage", checkSidebarState);
      clearInterval(interval);
    };
  }, []);

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

  const handleLogout = () => logoutMutation.mutate();
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Determine if we're on a route that shows the sidebar
  const noSidebarPaths = ["/", "/login", "/signup", "/verify", "/forgot-password"];
  const isResetPasswordRoute = location.startsWith("/reset-password/");
  const showsSidebar = isAuthenticated && !noSidebarPaths.includes(location) && !isResetPasswordRoute;

  return (
    <nav
      className={cn(
        "fixed top-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border transition-all duration-300",
        showsSidebar
          ? sidebarCollapsed
            ? "left-0 lg:left-20"
            : "left-0 lg:left-64"
          : "left-0"
      )}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Only show on non-sidebar pages */}
          {!showsSidebar && (
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Shield className="text-primary h-8 w-8" />
              <span className="text-xl font-bold text-foreground">GLI Pro</span>
            </Link>
          )}

          {/* Spacer for sidebar pages */}
          {showsSidebar && <div className="flex-1" />}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center ml-auto">
            {isLoading ? (
              // Loading state - show nothing to prevent flash
              <div className="w-12 h-12" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                {location !== "/dashboard" && (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                )}
                
                {/* User Menu - Fixed Position Container */}
                <div className="relative w-12 h-12">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="absolute inset-0 w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-300 active:bg-gray-300 transition-colors duration-200 flex items-center justify-center outline-none"
                        aria-label="User menu"
                      >
                        <User className="w-6 h-6 text-gray-700" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="px-3 py-3 border-b border-border">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <Link href="/settings">
                        <DropdownMenuItem className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Configuration Settings</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {logoutMutation.isPending ? "Logging out..." : "Logout"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="ml-4">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Only on non-sidebar pages */}
          {!showsSidebar && (
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? (
                  <span className="text-2xl">×</span>
                ) : (
                  <span className="text-xl">☰</span>
                )}
              </Button>
            </div>
          )}

          {/* Mobile user menu on sidebar pages */}
          {showsSidebar && (
            <div className="md:hidden">
              {isLoading ? (
                <div className="w-10 h-10" />
              ) : (
                <div className="relative w-10 h-10">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="absolute inset-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-300 active:bg-gray-300 transition-colors duration-200 flex items-center justify-center outline-none"
                      aria-label="User menu"
                    >
                      <User className="w-5 h-5 text-gray-700" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-3 py-3 border-b border-border">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <Link href="/settings">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && !showsSidebar && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Welcome, {user?.firstName}
                  </div>
                  {location !== "/dashboard" && (
                    <Link href="/dashboard" className="block">
                      <Button variant="outline" className="w-full justify-start mb-2">
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <Link href="/settings" className="block">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block">
                    <Button variant="ghost" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" className="block">
                    <Button className="w-full justify-start">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}