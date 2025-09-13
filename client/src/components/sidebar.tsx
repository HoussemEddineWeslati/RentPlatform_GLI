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
  X,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", testId: "link-dashboard" },
    { href: "/properties", icon: Building, label: "Properties", testId: "link-properties" },
    { href: "/tenants", icon: Users, label: "Tenants", testId: "link-tenants" },
    { href: "/quote", icon: Calculator, label: "Quote", testId: "link-quote" },
  ];

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-border">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Shield className="text-primary h-8 w-8" />
          {(!isCollapsed || mobile) && (
            <span className="ml-2 font-bold text-xl text-foreground">GLI Pro</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {isAuthenticated ? (
          <>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} data-testid={item.testId}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && !mobile && "px-2"
                    )}
                    onClick={() => mobile && setIsMobileOpen(false)}
                  >
                    <Icon className={cn("h-4 w-4", (!isCollapsed || mobile) && "mr-2")} />
                    {(!isCollapsed || mobile) && item.label}
                  </Button>
                </Link>
              );
            })}
          </>
        ) : (
          <div className="text-center text-muted-foreground text-sm">
            Please log in to access features
          </div>
        )}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        {isAuthenticated ? (
          <div className="space-y-2">
            {(!isCollapsed || mobile) && (
              <div className="px-2 py-1 text-sm text-muted-foreground">
                Welcome, {user?.firstName}
              </div>
            )}
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start",
                isCollapsed && !mobile && "px-2"
              )}
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className={cn("h-4 w-4", (!isCollapsed || mobile) && "mr-2")} />
              {(!isCollapsed || mobile) && (logoutMutation.isPending ? "Logging out..." : "Logout")}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link href="/login" data-testid="link-login">
              <Button variant="ghost" className="w-full justify-start">
                Login
              </Button>
            </Link>
            <Link href="/signup" data-testid="link-signup">
              <Button className="w-full justify-start">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Shield className="text-primary h-6 w-6 mr-2" />
            <span className="font-bold text-lg text-foreground">GLI Pro</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileSidebar}
            data-testid="button-mobile-menu"
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent mobile />
      </div>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex fixed top-0 left-0 z-40 h-full bg-card border-r border-border transition-all duration-200",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex flex-col w-full">
          <SidebarContent />
          
          {/* Collapse Toggle */}
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="w-full"
              data-testid="button-toggle-sidebar"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}