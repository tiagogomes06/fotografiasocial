import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import PhotoAccess from "./pages/PhotoAccess";
import Admin from "./pages/Admin";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import MBWayConfirmation from "./pages/MBWayConfirmation";

const queryClient = new QueryClient();

const App = () => {
  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/access" element={<PhotoAccess />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/store" element={<Store />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/mbway-confirmation" element={<MBWayConfirmation />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </QueryClientProvider>
    </TooltipProvider>
  );
};

export default App;