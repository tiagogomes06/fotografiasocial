import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PhotoAccess from "./pages/PhotoAccess";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import MBWayConfirmation from "./pages/MBWayConfirmation";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PhotoAccess />} />
          <Route path="/store" element={<Store />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/mbway-confirmation" element={<MBWayConfirmation />} />
          <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
        </Routes>
        <Toaster />
        <SonnerToaster position="top-center" />
      </AuthProvider>
    </Router>
  );
}

export default App;