// export default App;

import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
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
import PropertyDetailPage from "@/pages/landlords/[id]/properties/[propertyId]"; // Import the new page

function AppRoutes() {
  const { isLoading, isAuthenticated } = useAuth();
  const showSidebar = isAuthenticated;

  return (
    <>
      {showSidebar && <Sidebar />}
      <div className={showSidebar ? "lg:ml-64 min-h-screen" : "min-h-screen"}>
        {showSidebar && <div className="lg:hidden h-16"></div>}
        <Switch>
          {isLoading ? (
            <Route>
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </Route>
          ) : (
            <>
              <Route path="/" component={Home} />
              {isAuthenticated ? (
                <>
                  <Route path="/dashboard" component={Dashboard} />
                  {/* Landlord Routes */}
                  <Route path="/landlords" component={LandlordsPage} />
                  <Route path="/landlords/:id" component={LandlordDetailPage} />
                  <Route path="/landlords/:id/properties" component={LandlordPropertiesPage} />
                  <Route path="/landlords/:id/tenants" component={LandlordTenantsPage} />
                  
                  {/* ADDED: New nested route for a specific property's details and tenants */}
                  <Route path="/landlords/:id/properties/:propertyId" component={PropertyDetailPage} />

                  <Route path="/quote" component={Quote} />
                </>
              ) : (
                <>
                  <Route path="/login" component={Login} />
                  <Route path="/signup" component={Signup} />
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
