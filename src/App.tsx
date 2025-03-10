
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TimeProvider } from "./context/TimeEntriesContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layouts
import Navbar from "./components/layout/Navbar";

// Pages
import Index from "./pages/Index";
import History from "./pages/History";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Teams from "./pages/Teams";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        isAuthenticated ? (
          <>
            <Navbar />
            <main className="flex-1">
              <Index />
            </main>
          </>
        ) : (
          <Navigate to="/auth/login" replace />
        )
      } />
      
      <Route path="/history" element={
        <ProtectedRoute>
          <Navbar />
          <main className="flex-1">
            <History />
          </main>
        </ProtectedRoute>
      } />
      
      <Route path="/stats" element={
        <ProtectedRoute>
          <Navbar />
          <main className="flex-1">
            <Stats />
          </main>
        </ProtectedRoute>
      } />
      
      <Route path="/teams" element={
        <ProtectedRoute>
          <Navbar />
          <main className="flex-1">
            <Teams />
          </main>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Navbar />
          <main className="flex-1">
            <Settings />
          </main>
        </ProtectedRoute>
      } />
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TimeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-slate-950">
              <AppRoutes />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </TimeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
