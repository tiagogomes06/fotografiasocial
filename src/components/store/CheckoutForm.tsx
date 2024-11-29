import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartItem } from "@/types/admin";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  cart: CartItem[];
  onBack: () => void;
}

const CheckoutForm = ({ cart, onBack }: CheckoutFormProps) => {
  const navigate = useNavigate();
  const [shippingMethod, setShippingMethod] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: shippingMethods = [] } = useQuery({
    queryKey: ["shippingMethods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipping_methods")
        .select("*")
        .order("price");
      
      if (error) throw error;
      return data;
    },
  });

  const isPickupMethod = shippingMethod && shippingMethods.find(
    method => method.id === shippingMethod
  )?.type === "pickup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingMethod || !paymentMethod) {
      toast.error("Por favor selecione o método de envio e pagamento");
      return;
    }

    if (!isPickupMethod && (!formData.address || !formData.postalCode || !formData.city)) {
      toast.error("Por favor preencha todos os campos de envio");
      return;
    }

    try {
      setIsProcessing(true);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          student_id: cart[0]?.studentId,
          total_amount: cart.reduce((sum, item) => sum + item.price, 0),
          shipping_method_id: shippingMethod,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_postal_code: formData.postalCode,
          shipping_name: formData.name,
          shipping_phone: formData.phone,
          payment_method: paymentMethod,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        photo_id: item.photoId,
        product_id: item.productId,
        price_at_time: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Process payment
      const { data: payment } = await supabase.functions.invoke("create-payment", {
        body: { orderId: order.id, paymentMethod },
      });

      if (paymentMethod === "card") {
        // Redirect to Stripe Checkout
        window.location.href = payment.url;
      } else {
        // Show payment details for EuPago methods
        toast.success("Pedido criado com sucesso!");
        if (paymentMethod === "mbway") {
          toast.info("Por favor, confirme o pagamento na sua app MB WAY");
        } else if (paymentMethod === "multibanco") {
          toast.info(`
            Referência Multibanco:
            Entidade: ${payment.entity}
            Referência: ${payment.reference}
            Valor: ${payment.amount}€
          `);
        }
        navigate("/");
      }
    } catch (error) {
      console.error("Error processing order:", error);
      toast.error("Erro ao processar o pedido. Por favor tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Dados de Envio</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Método de Envio</Label>
            <Select value={shippingMethod} onValueChange={setShippingMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método de envio" />
              </SelectTrigger>
              <SelectContent>
                {shippingMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name} {method.price > 0 ? `(${method.price}€)` : "(Grátis)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isPickupMethod && (
            <>
              <div>
                <Label htmlFor="address">Morada</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="postalCode">Código Postal</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Método de Pagamento</h2>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o método de pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mbway">MBWay</SelectItem>
            <SelectItem value="multibanco">Multibanco</SelectItem>
            <SelectItem value="card">Cartão de Crédito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          disabled={isProcessing}
        >
          Voltar ao Carrinho
        </Button>
        <Button type="submit" disabled={isProcessing}>
          {isProcessing ? "A processar..." : "Finalizar Compra"}
        </Button>
      </div>
    </form>
  );
};

export default CheckoutForm;