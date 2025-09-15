import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Users,
  Building,
  Calculator,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!isAuthenticated) return null;

  const navigation: { name: string; href: string; icon: React.ElementType }[] = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Tenants", href: "/tenants", icon: Users },
    { name: "Properties", href: "/properties", icon: Building },
    { name: "Quote Calculator", href: "/quote", icon: Calculator },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          className="fixed top-4 left-4 z-50"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="text-primary h-8 w-8" />
            <span className="text-xl font-bold text-foreground">GLI Pro</span>
          </Link>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive &&
                        "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
