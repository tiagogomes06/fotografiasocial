import { Button } from "@/components/ui/button";
import { CartItem, Product } from "@/types/admin";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface CartSummaryProps {
  cart: CartItem[];
  products: Product[];
  onCheckout: () => void;
}

const CartSummary = ({ cart, products, onCheckout }: CartSummaryProps) => {
  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    try {
      onCheckout();
    } catch (error) {
      console.error("Erro ao processar checkout:", error);
      toast.error("Erro ao processar checkout");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Carrinho de Compras</h3>
        <Button 
          onClick={handleCheckout} 
          disabled={cart.length === 0} 
          className="bg-primary hover:bg-primary/90 text-white gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Finalizar ({totalAmount.toFixed(2)}€)
        </Button>
      </div>
      
      <div className="space-y-4">
        {cart.map((item, index) => {
          const product = products.find(p => p.id === item.productId);
          return (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-md overflow-hidden">
                  <img
                    src={item.photoUrl}
                    alt={`Item do carrinho ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{product?.name}</p>
                  <p className="text-sm text-gray-500">{item.price}€</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartSummary;