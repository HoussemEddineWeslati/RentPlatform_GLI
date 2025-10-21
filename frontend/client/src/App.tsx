// src/App.tsx - UPDATED VERSION

import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation, useRoute } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Quote from "@/pages/quote";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Page Imports
import LandlordsPage from "@/pages/landlords/index";
import LandlordDetailPage from "@/pages/landlords/[id]/index";
import LandlordPropertiesPage from "@/pages/landlords/[id]/properties";
import LandlordTenantsPage from "@/pages/landlords/[id]/tenants";
import PropertyDetailPage from "@/pages/landlords/[id]/properties/[propertyId]";
import SettingsPage from "@/pages/settings";
import ProfilePage from "@/pages/profile"; // NEW IMPORT

// Authentication-related routes
import Verify from "@/pages/verify";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password/[token]";

function AppRoutes() {
  const { isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isResetPasswordRoute] = useRoute("/reset-password/:token");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const noSidebarPaths = [
    "/",
    "/login",
    "/signup",
    "/verify",
    "/forgot-password",
  ];
  const isFullPageLayout =
    noSidebarPaths.includes(location) || isResetPasswordRoute;
  const showSidebar = isAuthenticated && !isFullPageLayout;

  return (
    <>
      {showSidebar && <Sidebar />}
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          showSidebar && (sidebarCollapsed ? "lg:ml-20" : "lg:ml-64")
        )}
      >
        <div className="h-16" />
        <Switch>
          {isLoading ? (
            <Route>
              <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="h-8 w-8 bg-primary rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </Route>
          ) : (
            <>
              <Route path="/" component={Home} />
              {!isAuthenticated && (
                <>
                  <Route path="/login" component={Login} />
                  <Route path="/signup" component={Signup} />
                  <Route path="/verify" component={Verify} />
                  <Route path="/forgot-password" component={ForgotPassword} />
                  <Route
                    path="/reset-password/:token"
                    component={ResetPassword}
                  />
                </>
              )}
              {isAuthenticated && (
                <>
                  <Route path="/dashboard" component={Dashboard} />
                  <Route path="/landlords" component={LandlordsPage} />
                  <Route path="/landlords/:id" component={LandlordDetailPage} />
                  <Route
                    path="/landlords/:id/properties"
                    component={LandlordPropertiesPage}
                  />
                  <Route
                    path="/landlords/:id/tenants"
                    component={LandlordTenantsPage}
                  />
                  <Route
                    path="/landlords/:id/properties/:propertyId"
                    component={PropertyDetailPage}
                  />
                  <Route path="/quote" component={Quote} />
                  <Route path="/settings" component={SettingsPage} />
                  {/* NEW: Profile Route */}
                  <Route path="/profile" component={ProfilePage} />
                </>
              )}
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Navbar />
        <AppRoutes />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;