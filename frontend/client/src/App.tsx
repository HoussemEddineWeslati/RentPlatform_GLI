import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation, useRoute } from "wouter"; // Import useRoute
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
// Page Imports
import LandlordsPage from "@/pages/landlords/index";
import LandlordDetailPage from "@/pages/landlords/[id]/index";
import LandlordPropertiesPage from "@/pages/landlords/[id]/properties";
import LandlordTenantsPage from "@/pages/landlords/[id]/tenants";
import PropertyDetailPage from "@/pages/landlords/[id]/properties/[propertyId]";
import SettingsPage from "@/pages/settings";
// Authentication-related routes
import Verify from "@/pages/verify";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password/[token]";

function AppRoutes() {
  const { isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();

  // FIX: Correctly determine which routes should not display the sidebar.
  const [isResetPasswordRoute] = useRoute("/reset-password/:token");
  const noSidebarPaths = [
    "/",
    "/login",
    "/signup",
    "/verify",
    "/forgot-password",
  ];

  // A route is considered "full page" (no sidebar) if it's in our explicit list or matches a dynamic route like reset password.
  const isFullPageLayout =
    noSidebarPaths.includes(location) || isResetPasswordRoute;

  // The sidebar should only be shown if the user is authenticated AND it's not a full-page layout.
  const showSidebar = isAuthenticated && !isFullPageLayout;

  return (
    <>
      {showSidebar && <Sidebar />}
      <div className={showSidebar ? "lg:ml-64 min-h-screen" : "min-h-screen"}>
        {/* This div is a spacer for mobile view to push content below the fixed navbar when the sidebar is open */}
        {showSidebar && <div className="h-16 lg:hidden" />}
        <Switch>
          {isLoading ? (
            <Route>
              <div className="flex items-center justify-center pt-16 h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </Route>
          ) : (
            <>
              <Route path="/" component={Home} />
              {/* Public / unauthenticated routes */}
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
              {/* Protected / authenticated routes */}
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
