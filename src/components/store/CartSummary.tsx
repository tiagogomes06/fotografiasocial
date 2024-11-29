import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CartItem, Product } from "@/types/admin";
import { ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
      // Send email notification
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: "eu@tiagogomes.pt",
          subject: "Nova Compra - Fotografia Escolar",
          html: `
            <h1>Nova compra realizada</h1>
            <p>Total: ${totalAmount.toFixed(2)}€</p>
            <h2>Itens:</h2>
            <ul>
              ${cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                return `<li>${product?.name} - ${item.price}€</li>`;
              }).join('')}
            </ul>
          `
        }
      });

      if (error) {
        console.error("Erro ao enviar email:", error);
        toast.error("Erro ao enviar notificação de compra");
      }

      // Continue with checkout
      onCheckout();
    } catch (error) {
      console.error("Erro ao processar checkout:", error);
      toast.error("Erro ao processar checkout");
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Carrinho de Compras</h3>
          <Button onClick={handleCheckout} disabled={cart.length === 0} className="gap-2">
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