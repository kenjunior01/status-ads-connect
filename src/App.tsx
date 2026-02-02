import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { LocalizationProvider } from "@/contexts/LocalizationContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { CreatorDashboard } from "./pages/CreatorDashboard";
import { AdvertiserDashboard } from "./pages/AdvertiserDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

// Initialize i18n
import "@/lib/i18n";

const queryClient = new QueryClient();

function App() {
  const [currentPage, setCurrentPage] = useState("index");

  const renderPage = () => {
    switch (currentPage) {
      case "index":
        return <Index onNavigate={setCurrentPage} />;
      case "auth":
        return <Auth onNavigate={setCurrentPage} />;
      case "creator-dashboard":
        return <CreatorDashboard />;
      case "advertiser-dashboard":
        return <AdvertiserDashboard />;
      case "admin-dashboard":
        return <AdminDashboard />;
      case "creators":
        return <Index onNavigate={setCurrentPage} />;
      default:
        return <Index onNavigate={setCurrentPage} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen bg-background">
            <Navigation onNavigate={setCurrentPage} currentPage={currentPage} />
            <main>
              {renderPage()}
            </main>
          </div>
        </TooltipProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;
