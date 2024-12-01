import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CartSummary from "@/components/store/CartSummary";
import CheckoutForm from "@/components/store/CheckoutForm";
import { toast } from "sonner";
import { CartItem } from "@/types/admin";

const Cart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart: initialCart = [], products = [] } = location.state || {};
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      toast.error("Por favor, volte à página inicial e acesse suas fotos novamente");
      navigate('/');
    }
  }, [navigate]);

  const handleBackToStore = () => {
    navigate(-1);
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    const updatedCart = [...cart];
    updatedCart[index] = {
      ...updatedCart[index],
      quantity: newQuantity
    };
    setCart(updatedCart);
  };

  const startCheckout = () => {
    if (!cart || cart.length === 0) {
      toast.error("O carrinho está vazio");
      return;
    }

    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
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
            onUpdateQuantity={handleUpdateQuantity}
          />
        )}
      </div>
    </div>
  );
};

export default Cart;