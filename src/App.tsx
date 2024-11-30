import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PhotoAccess from "./pages/PhotoAccess";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import MBWayConfirmation from "./pages/MBWayConfirmation";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PhotoAccess />} />
        <Route path="/store" element={<Store />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/mbway-confirmation" element={<MBWayConfirmation />} />
        <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
      </Routes>
      <Toaster />
      <SonnerToaster position="top-center" />
    </Router>
  );
}

export default App;