// src/pages/settings/SettingsSidebar.tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Edit, Eye } from "lucide-react";

interface SettingsSidebarProps {
  view: 'display' | 'edit';
  setView: (view: 'display' | 'edit') => void;
}

export function SettingsSidebar({ view, setView }: SettingsSidebarProps) {
  const navigation = [
    { name: "View Configuration", viewId: 'display', icon: Eye },
    { name: "Update Configuration", viewId: 'edit', icon: Edit },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-border hidden lg:flex flex-col">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Settings</h2>
      </div>
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = view === item.viewId;
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                )}
                onClick={() => setView(item.viewId as 'display' | 'edit')}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
