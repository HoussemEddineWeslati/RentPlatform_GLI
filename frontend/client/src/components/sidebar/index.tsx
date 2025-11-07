// src/components/sidebar/index.tsx
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  BarChart3,
  Menu,
  X,
  UserSquare,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import your custom logo with eager loading to avoid flickering
import shieldLogo from "@/assets/logo/shield-logo.png?url";

export function Sidebar() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  if (!isAuthenticated) return null;

  const navigation: { name: string; href: string; icon: React.ElementType }[] = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Landlords", href: "/landlords", icon: UserSquare },
    { name: "Policies", href: "/policies", icon: Shield },
    { name: "Claims", href: "/claims", icon: AlertCircle },
    { name: "Risk Calculator", href: "/quote", icon: Calculator },
  ];

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Logo Section */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border transition-all duration-300",
          isCollapsed && !isMobile ? "justify-center px-2" : "justify-between px-6"
        )}
      >
        <Link href="/" className="flex items-center space-x-2 group">
          {/* Custom Shield Logo Image - no fallback to prevent flicker */}
          <img 
            src={shieldLogo} 
            alt="GLI Pro Logo" 
            loading="eager"
            decoding="sync"
            className={cn(
              "transition-all group-hover:scale-110 object-contain",
              isCollapsed && !isMobile ? "h-10 w-10" : "h-8 w-8"
            )}
            style={{ imageRendering: 'crisp-edges' }}
          />
          {(!isCollapsed || isMobile) && (
            <span className="text-xl font-bold text-foreground whitespace-nowrap">
              GLI Pro
            </span>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className={cn(
              "h-8 w-8 rounded-full transition-all duration-300 hover:bg-gray-700 hover:text-white",
              isCollapsed && "absolute -right-3 top-5 bg-white border border-border shadow-md"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.startsWith(item.href);
            
            const ButtonContent = (
              <button
                className={cn(
                  "w-full transition-all duration-200 rounded-lg flex items-center relative overflow-hidden",
                  isCollapsed && !isMobile
                    ? "justify-center p-3"
                    : "justify-start px-4 py-3",
                  isActive
                    ? "text-slate-700 font-semibold"
                    : "text-muted-foreground hover:bg-gray-700 hover:text-white"
                )}
                onClick={() => isMobile && setIsMobileOpen(false)}
              >
                {/* Icon container with fixed size */}
                <div className="flex items-center justify-center w-7 h-7 flex-shrink-0">
                  <item.icon
                    className="h-7 w-7"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                {(!isCollapsed || isMobile) && (
                  <span className={cn(
                    "ml-3 text-base transition-opacity duration-200 whitespace-nowrap",
                    isActive && "font-semibold",
                    isCollapsed && !isMobile ? "opacity-0 w-0" : "opacity-100"
                  )}>
                    {item.name}
                  </span>
                )}
              </button>
            );

            return (
              <Link key={item.name} href={item.href}>
                {isCollapsed && !isMobile ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{ButtonContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  ButtonContent
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer Section (optional) */}
      {(!isCollapsed || isMobile) && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            © 2025 GLI Pro
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="bg-white shadow-lg"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed inset-y-0 left-0 z-50 bg-white border-r border-border flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent isMobile />
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}