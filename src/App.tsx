import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx";
import MealPlanner from "./pages/MealPlanner.tsx";
import Recipes from "./pages/Recipes.tsx";
import Pantry from "./pages/Pantry.tsx";
import Profile from "./pages/Profile.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthScreen from "./pages/AuthScreen.tsx";
import { PantryProvider } from "./context/PantryContext.tsx";
import { ProfileProvider } from "./context/ProfileContext.tsx";
import { ShoppingProvider } from "./context/ShoppingContext.tsx";
import { MealPlanProvider } from "./context/MealPlanContext.tsx";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";

const queryClient = new QueryClient();

// Shown only when authenticated — all data contexts live here
const AuthenticatedApp = () => (
  <ProfileProvider>
    <PantryProvider>
      <ShoppingProvider>
        <MealPlanProvider>
          <TooltipProvider>
            <BrowserRouter>
              <ScrollToTop />
              <div className="flex flex-col h-dvh overflow-hidden">
                <main id="main-scroll" className="flex-1 overflow-y-auto overscroll-contain">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/planner" element={<MealPlanner />} />
                    <Route path="/pantry" element={<Pantry />} />
                    <Route path="/recipes" element={<Recipes />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <BottomNav />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </MealPlanProvider>
      </ShoppingProvider>
    </PantryProvider>
  </ProfileProvider>
);

// Gate: shows auth screen or the full app
const AppGate = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AuthenticatedApp /> : <AuthScreen onAuth={() => {}} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <Sonner />
      <AppGate />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
