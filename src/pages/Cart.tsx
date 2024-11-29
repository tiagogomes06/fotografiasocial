import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CartSummary from "@/components/store/CartSummary";
import CheckoutForm from "@/components/store/CheckoutForm";
import { CartItem, Product } from "@/types/admin";
import { toast } from "sonner";

const Cart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart = [], products = [] } = location.state || {};
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleBackToStore = () => {
    navigate(-1);
  };

  const startCheckout = () => {
    if (!cart || cart.length === 0) {
      toast.error("O carrinho está vazio");
      return;
    }

    if (!cart[0]?.studentId) {
      toast.error("Por favor, volte à página inicial e acesse suas fotos novamente");
      navigate('/');
      return;
    }

    setIsCheckingOut(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handleBackToStore}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à Loja
          </Button>
        </div>

        {isCheckingOut ? (
          <CheckoutForm cart={cart} onBack={() => setIsCheckingOut(false)} />
        ) : (
          <CartSummary
            cart={cart}
            products={products}
            onCheckout={startCheckout}
          />
        )}
      </div>
    </div>
  );
};

export default Cart;