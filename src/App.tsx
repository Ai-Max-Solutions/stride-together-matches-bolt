import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AccessibilitySkipNav } from "@/components/ui/accessibility-skip-nav";
import { BetaBadge } from "@/components/common/BetaBadge";
import { useAnalytics } from "@/hooks/use-analytics";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import NotFound from "./pages/NotFound";

// Lazy load heavy pages for better performance
const Browse = lazy(() => import("./pages/Browse"));
const Messages = lazy(() => import("./pages/Messages"));
const Chat = lazy(() => import("./pages/Chat"));
const Settings = lazy(() => import("./pages/Settings"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
    <LoadingSpinner size="lg" message="Loading..." />
  </div>
);

const AppContent = () => {
  useAnalytics(); // Track page visits
  return (
    <>
      <BetaBadge />
      <AccessibilitySkipNav />
      <Toaster />
      <Sonner />
      <Suspense fallback={<PageFallback />}>
        <main id="main-content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile/setup" element={<ProfileSetup />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chat/:conversationId" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Suspense>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
