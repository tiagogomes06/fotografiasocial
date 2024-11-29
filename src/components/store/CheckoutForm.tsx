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
import { ensurePhotosExist, createOrder, createOrderItems, processPayment } from "@/utils/orderUtils";

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!STRIPE_PUBLIC_KEY) {
  console.error('VITE_STRIPE_PUBLIC_KEY is not set in environment variables');
}

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY || '');

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
    email: "",
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

    if (!formData.email) {
      toast.error("Por favor preencha o email");
      return;
    }

    if (!isPickupMethod && (!formData.address || !formData.postalCode || !formData.city)) {
      toast.error("Por favor preencha todos os campos de envio");
      return;
    }

    if (!cart[0]?.studentId) {
      toast.error("Erro ao processar o pedido: ID do estudante não encontrado");
      return;
    }

    try {
      setIsProcessing(true);
      toast.info("A processar o seu pedido...");

      await ensurePhotosExist(cart);

      const order = await createOrder(
        cart,
        cart[0].studentId,
        shippingMethod,
        formData,
        paymentMethod
      );

      await createOrderItems(cart, order.id);

      // Send order creation email
      const { error: emailError } = await supabase.functions.invoke('send-order-email', {
        body: { 
          orderId: order.id,
          type: 'created'
        }
      });

      if (emailError) {
        console.error('Error sending order email:', emailError);
        toast.error('Erro ao enviar email de confirmação');
      }

      // Add a longer delay (2 seconds) before processing payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      const payment = await processPayment(
        order.id,
        paymentMethod,
        formData.email,
        formData.name
      );

      if (paymentMethod === "card") {
        toast.success("Redirecionando para página de pagamento...");
        window.location.href = payment.url;
      } else {
        toast.success("Pedido criado com sucesso!");
        
        if (paymentMethod === "mbway") {
          toast.info("Por favor, confirme o pagamento na sua app MB WAY", {
            duration: 10000
          });
          
          if (payment.error) {
            toast.error(`Erro MBWay: ${payment.error}`, {
              duration: 10000
            });
          }
        } else if (paymentMethod === "multibanco") {
          const message = `
            Referência Multibanco:
            Entidade: ${payment.entity}
            Referência: ${payment.reference}
            Valor: ${payment.amount}€
          `;
          toast.info(message, {
            duration: 20000
          });
          
          if (payment.error) {
            toast.error(`Erro Multibanco: ${payment.error}`, {
              duration: 10000
            });
          }
        }
        navigate("/");
      }
    } catch (error) {
      console.error("Error processing order:", error);
      toast.error(`Erro ao processar o pedido: ${error.message || 'Erro desconhecido'}. Por favor tente novamente.`, {
        duration: 10000
      });
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