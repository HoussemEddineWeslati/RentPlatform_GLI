// import { Link, useLocation } from "wouter";
// import { useAuth } from "@/hooks/use-auth";
// import { apiRequest } from "@/lib/queryClient";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useToast } from "@/hooks/use-toast";
// import { Button } from "@/components/ui/button";
// import { useState } from "react";
// import { 
//   Shield, 
//   Menu,
//   X,
//   LogOut
// } from "lucide-react";

// export function Navbar() {
//   const [location, navigate] = useLocation();
//   const { user, isAuthenticated } = useAuth();
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const logoutMutation = useMutation({
//     mutationFn: () => apiRequest("POST", "/api/auth/logout"),
//     onSuccess: () => {
//       queryClient.clear();
//       toast({
//         title: "Logged out successfully",
//         description: "You have been logged out.",
//       });
//       navigate("/");
//     },
//     onError: () => {
//       toast({
//         title: "Logout failed",
//         description: "Failed to logout. Please try again.",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleLogout = () => {
//     logoutMutation.mutate();
//   };

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
//             <Shield className="text-primary h-8 w-8" />
//             <span className="text-xl font-bold text-foreground">GLI Pro</span>
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-6">
//             {isAuthenticated ? (
//               <>
//                 <span className="text-sm text-muted-foreground">
//                   Welcome, {user?.firstName}
//                 </span>
//                 <Link href="/dashboard">
//                   <Button variant="outline" className="mr-2">
//                     Go to Dashboard
//                   </Button>
//                 </Link>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={handleLogout}
//                   disabled={logoutMutation.isPending}
//                   className="text-muted-foreground hover:text-foreground"
//                 >
//                   <LogOut className="h-4 w-4 mr-2" />
//                   {logoutMutation.isPending ? "Logging out..." : "Logout"}
//                 </Button>
//               </>
//             ) : (
//               <>
//                 <Link href="/login">
//                   <Button variant="ghost">Login</Button>
//                 </Link>
//                 <Link href="/signup">
//                   <Button>Get Started</Button>
//                 </Link>
//               </>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <div className="md:hidden">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={toggleMobileMenu}
//               className="p-2"
//             >
//               {isMobileMenuOpen ? (
//                 <X className="h-6 w-6" />
//               ) : (
//                 <Menu className="h-6 w-6" />
//               )}
//             </Button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {isMobileMenuOpen && (
//           <div className="md:hidden border-t border-border">
//             <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-sm">
//               {isAuthenticated ? (
//                 <>
//                   <div className="px-3 py-2 text-sm text-muted-foreground">
//                     Welcome, {user?.firstName}
//                   </div>
//                   <Link href="/dashboard" className="block">
//                     <Button variant="outline" className="w-full justify-start mb-2">
//                       Go to Dashboard
//                     </Button>
//                   </Link>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={handleLogout}
//                     disabled={logoutMutation.isPending}
//                     className="w-full justify-start text-muted-foreground hover:text-foreground"
//                   >
//                     <LogOut className="h-4 w-4 mr-2" />
//                     {logoutMutation.isPending ? "Logging out..." : "Logout"}
//                   </Button>
//                 </>
//               ) : (
//                 <>
//                   <Link href="/login" className="block">
//                     <Button variant="ghost" className="w-full justify-start">
//                       Login
//                     </Button>
//                   </Link>
//                   <Link href="/signup" className="block">
//                     <Button className="w-full justify-start">
//                       Get Started
//                     </Button>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// }
// client/src/components/navbar/index.tsx
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Shield, Menu, X, LogOut } from "lucide-react";

export function Navbar() {
  const [, navigate] = useLocation(); // ignore location since we don't use it
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

  const handleLogout = () => logoutMutation.mutate();
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Shield className="text-primary h-8 w-8" />
            <span className="text-xl font-bold text-foreground">GLI Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.firstName}
                </span>
                <Link href="/dashboard">
                  <Button variant="outline" className="mr-2">
                    Go to Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-sm">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Welcome, {user?.firstName}
                  </div>
                  <Link href="/dashboard" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start mb-2"
                    >
                      Go to Dashboard
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
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" className="block">
                    <Button className="w-full justify-start">
                      Get Started
                    </Button>
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
