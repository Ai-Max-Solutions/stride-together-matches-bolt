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
import { FloatingAssistant } from "@/components/common/FloatingAssistant";
import { useAnalytics } from "@/hooks/use-analytics";
import { PerformanceMonitor, usePerformanceMonitor } from "@/components/ui/performance-monitor";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import NotFound from "./pages/NotFound";

// Lazy load heavy pages for better performance
const Browse = lazy(() => import("./pages/Browse"));
const ClubEvents = lazy(() => import("./pages/ClubEvents"));
const Messages = lazy(() => import("./pages/Messages"));
const Chat = lazy(() => import("./pages/Chat"));
const Settings = lazy(() => import("./pages/Settings"));
const Chatbot = lazy(() => import("./pages/Chatbot"));
const Gamification = lazy(() => import("./pages/Gamification"));
const BrandedChallenges = lazy(() => import("./pages/BrandedChallenges"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
    <LoadingSpinner size="lg" message="Loading..." />
  </div>
);

const AppContent = () => {
  console.log('App.tsx: AppContent rendering...');
  const { isEnabled: perfMonitorEnabled } = usePerformanceMonitor();
  useAnalytics(); // Track page visits
  console.log('App.tsx: useAnalytics completed');
  return (
    <>
      <BetaBadge />
      <FloatingAssistant />
      <AccessibilitySkipNav />
      <PerformanceMonitor enabled={perfMonitorEnabled} />
      <Toaster />
      <Sonner />
      <Suspense fallback={<PageFallback />}>
        <main id="main-content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile/setup" element={<ProfileSetup />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/clubs" element={<ClubEvents />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chat/:conversationId" element={<Chat />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/progress" element={<Gamification />} />
            <Route path="/branded-challenges" element={<BrandedChallenges />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Suspense>
    </>
  );
};

const App = () => {
  console.log('App.tsx: Main App component rendering...');
  return (
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
};

export default App;
