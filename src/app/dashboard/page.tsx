'use client';
import MetabaseDashboard from '@/components/MetabaseDashboard';

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Optional Header - Remove if you want the dashboard to take the entire screen */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-xl font-semibold">Analytics Dashboard</h1>
      </header>
      
      {/* Main content area - flex-grow will make it take all available space */}
      <main className="flex-grow">
        <div className="h-full w-full">
          <MetabaseDashboard 
            dashboardId={1} // Replace with your dashboard ID
            params={{
              // Optional dashboard parameters
            }}
          />
        </div>
      </main>
    </div>
  );
}
