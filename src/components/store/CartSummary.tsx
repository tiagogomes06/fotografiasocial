import { Button } from "@/components/ui/button";
import { CartItem, Product } from "@/types/admin";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface CartSummaryProps {
  cart: CartItem[];
  products: Product[];
  onCheckout: () => void;
  onUpdateQuantity?: (index: number, newQuantity: number) => void;
}

const CartSummary = ({ cart, products, onCheckout, onUpdateQuantity }: CartSummaryProps) => {
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const handleCheckout = async () => {
    try {
      onCheckout();
    } catch (error) {
      console.error("Erro ao processar checkout:", error);
      toast.error("Erro ao processar checkout");
    }
  };

  const handleQuantityChange = (index: number, change: number) => {
    if (!onUpdateQuantity) return;
    
    const currentQuantity = cart[index].quantity || 1;
    const newQuantity = currentQuantity + change;
    
    if (newQuantity >= 1) {
      onUpdateQuantity(index, newQuantity);
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
          const quantity = item.quantity || 1;
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
                  <p className="text-sm text-gray-500">{item.price}€ x {quantity}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(index, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(index, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{(item.price * quantity).toFixed(2)}€</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartSummary;