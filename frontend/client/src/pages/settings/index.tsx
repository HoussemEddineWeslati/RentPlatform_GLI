// src/pages/settings/index.tsx
import { useState } from "react";
import { ConfigDisplay } from "./ConfigDisplay";
import { ConfigForm } from "./ConfigForm";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');

  const tabs = [
    { id: 'view' as const, label: 'View Configuration' },
    { id: 'edit' as const, label: 'Update Configuration' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Settings Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-foreground">Configuration Settings</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your scoring configuration and system preferences
            </p>
          </div>
          
          {/* Sub-Navigation Tabs */}
          <div className="flex space-x-8 border-b border-border -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'view' && <ConfigDisplay />}
        {activeTab === 'edit' && <ConfigForm onFinished={() => setActiveTab('view')} />}
      </div>
    </div>
  );
}