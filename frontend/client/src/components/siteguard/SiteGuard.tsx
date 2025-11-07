// client/src/components/SiteGuard.tsx
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";

// The password from your .env file
const SITE_PASSWORD = import.meta.env.VITE_SITE_PASSWORD;

// This key will be used to store auth status in sessionStorage
const AUTH_KEY = "site_guard_auth";

type SiteGuardProps = {
  children: ReactNode;
};

export function SiteGuard({ children }: SiteGuardProps) {
  // Check sessionStorage to see if user is already authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem(AUTH_KEY) === "true"
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SITE_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password.");
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated, show a clean login screen
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <Shield className="w-12 h-12 text-primary mb-3" />
          <h2 className="text-2xl font-bold text-center">Protected Access</h2>
          <p className="text-sm text-muted-foreground">
            Please enter the password to view this site.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-center"
          />
          {error && (
            <p className="text-sm text-center text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full">
            Unlock
          </Button>
        </form>
      </div>
    </div>
  );
}