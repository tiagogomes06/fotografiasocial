import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CartItem, Product } from "@/types/admin";
import { ShoppingCart } from "lucide-react";

interface CartSummaryProps {
  cart: CartItem[];
  products: Product[];
  onCheckout: () => void;
}

const CartSummary = ({ cart, products, onCheckout }: CartSummaryProps) => {
  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Carrinho de Compras</h3>
          <Button onClick={onCheckout} disabled={cart.length === 0} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Finalizar Compra ({totalAmount.toFixed(2)}€)
          </Button>
        </div>
        
        <div className="space-y-4">
          {cart.map((item, index) => {
            const product = products.find(p => p.id === item.productId);
            return (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <img
                    src={item.photoUrl}
                    alt={`Item do carrinho ${index + 1}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{product?.name}</p>
                    <p className="text-sm text-muted-foreground">{item.price}€</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CartSummary;