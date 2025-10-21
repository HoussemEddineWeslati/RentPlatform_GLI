// src/pages/profile/index.tsx

import { useState } from "react";
import { ProfileView } from "./ProfileView";
import { ProfileEdit } from "./ProfileEdit";
import { DeleteAccount } from "./DeleteAccount";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'delete'>('view');

  const tabs = [
    { id: 'view' as const, label: 'Profile Information' },
    { id: 'edit' as const, label: 'Edit Profile' },
    { id: 'delete' as const, label: 'Delete Account' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your personal information and account settings
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
        {activeTab === 'view' && <ProfileView onEdit={() => setActiveTab('edit')} />}
        {activeTab === 'edit' && <ProfileEdit onFinished={() => setActiveTab('view')} />}
        {activeTab === 'delete' && <DeleteAccount />}
      </div>
    </div>
  );
}