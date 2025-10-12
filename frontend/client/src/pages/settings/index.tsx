// src/pages/settings/index.tsx
import { useState } from "react";
import { ConfigDisplay } from "./ConfigDisplay";
import { ConfigForm } from "./ConfigForm";
import { SettingsSidebar } from "./SettingsSidebar";

export default function SettingsPage() {
  const [view, setView] = useState<'display' | 'edit'>('display');

  return (
    <div className="flex min-h-screen">
      <SettingsSidebar view={view} setView={setView} />
      
      <main className="flex-1 lg:ml-64">
        {/* pt-24 provides top padding to clear the fixed global navbar */}
        <div className="p-4 pt-24 sm:p-6 md:p-10">
          {view === 'display' && <ConfigDisplay />}
          {view === 'edit' && <ConfigForm onFinished={() => setView('display')} />}
        </div>
      </main>
    </div>
  );
}
