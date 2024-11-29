import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types/admin";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import ShippingForm from "./ShippingForm";
import PaymentMethodSelect from "./PaymentMethodSelect";

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

      const { data: payment } = await supabase.functions.invoke("create-payment", {
        body: { orderId: order.id, paymentMethod },
      });

      if (paymentMethod === "card") {
        window.location.href = payment.url;
      } else {
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
      <ShippingForm
        formData={formData}
        setFormData={setFormData}
        shippingMethod={shippingMethod}
        setShippingMethod={setShippingMethod}
        shippingMethods={shippingMethods}
        isPickupMethod={isPickupMethod}
      />

      <PaymentMethodSelect
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />

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