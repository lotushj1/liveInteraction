import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ParticipantProvider } from "@/contexts/ParticipantContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import EventDetail from "./pages/EventDetail";
import Join from "./pages/Join";
import Lobby from "./pages/participant/Lobby";
import QnA from "./pages/participant/QnA";
import Display from "./pages/Display";
import NotFound from "./pages/NotFound";
import { logger } from "@/lib/logger";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 分鐘內的資料視為新鮮
      gcTime: 1000 * 60 * 10, // 快取保留 10 分鐘 (原 cacheTime)
      retry: 1, // 失敗後重試 1 次
      refetchOnWindowFocus: false, // 視窗聚焦時不自動重新請求
    },
    mutations: {
      retry: 0, // mutation 失敗不重試
      onError: (error) => {
        logger.error('Mutation error:', error);
      },
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ParticipantProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/join" element={<Join />} />
                  <Route path="/participant/:id/lobby" element={<Lobby />} />
                  <Route path="/participant/:id/qna" element={<QnA />} />
                  <Route path="/display/:id" element={<Display />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/dashboard/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
                  <Route path="/dashboard/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ParticipantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
