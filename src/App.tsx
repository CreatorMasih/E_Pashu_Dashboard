import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import AnimalsPage from "./pages/AnimalsPage.tsx";
import AnimalProfilePage from "./pages/AnimalProfilePage.tsx";
import FarmersPage from "./pages/FarmersPage.tsx";
import VaccinationsPage from "./pages/VaccinationsPage.tsx";
import BreedingPage from "./pages/BreedingPage.tsx";
import AlertsPage from "./pages/AlertsPage.tsx";
import FieldOfficersPage from "./pages/FieldOfficersPage.tsx";
import AIInsightsPage from "./pages/AIInsightsPage.tsx";
import ReportsPage from "./pages/ReportsPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/animals" element={<AnimalsPage />} />
          <Route path="/animals/:id" element={<AnimalProfilePage />} />
          <Route path="/farmers" element={<FarmersPage />} />
          <Route path="/vaccinations" element={<VaccinationsPage />} />
          <Route path="/breeding" element={<BreedingPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/field-officers" element={<FieldOfficersPage />} />
          <Route path="/ai-insights" element={<AIInsightsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
