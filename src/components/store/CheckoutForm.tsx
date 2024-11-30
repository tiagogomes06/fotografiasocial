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
import { 
  ensurePhotosExist, 
  createOrder, 
  createOrderItems, 
  processPayment 
} from "@/utils/orderUtils";
import { ArrowLeft } from "lucide-react";

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

      const selectedShippingMethod = shippingMethods.find(method => method.id === shippingMethod);

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
          if (payment.error) {
            toast.error(`Erro MBWay: ${payment.error}`, {
              duration: 10000
            });
          } else {
            navigate("/mbway-confirmation", {
              state: {
                orderDetails: {
                  orderId: order.id,
                  name: formData.name,
                  address: formData.address,
                  city: formData.city,
                  postalCode: formData.postalCode,
                  email: formData.email,
                  phone: formData.phone,
                  shippingMethod: selectedShippingMethod?.name,
                  total: order.total_amount
                }
              }
            });
          }
        } else if (paymentMethod === "multibanco") {
          if (payment.error) {
            toast.error(`Erro Multibanco: ${payment.error}`, {
              duration: 10000
            });
          } else {
            navigate("/payment-confirmation", {
              state: {
                paymentDetails: {
                  entity: payment.entity,
                  reference: payment.reference,
                  amount: payment.amount
                }
              }
            });
          }
        }
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 space-y-8">
        <div className="flex items-center gap-4 pb-6 border-b">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onBack}
            className="gap-2"
            disabled={isProcessing}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Carrinho
          </Button>
          <h1 className="text-2xl font-bold">Finalizar Compra</h1>
        </div>

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

        <div className="pt-6 border-t">
          <Button 
            type="submit" 
            disabled={isProcessing}
            className="w-full h-12 text-lg"
          >
            {isProcessing ? "A processar..." : "Finalizar Compra"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CheckoutForm;
