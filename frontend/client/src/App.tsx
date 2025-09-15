import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Properties from "@/pages/properties";
import Tenants from "@/pages/tenants";
import Quote from "@/pages/quote";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath] = useLocation();
  
  const isHomePage = currentPath === "/";
  // const showSidebar = !isHomePage && (isAuthenticated || ["/login", "/signup"].includes(currentPath));
  const showSidebar = !isHomePage && isAuthenticated;

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
                  <Route path="/properties" component={Properties} />
                  <Route path="/tenants" component={Tenants} />
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
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
