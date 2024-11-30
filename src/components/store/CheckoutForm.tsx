import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/admin";
import { toast } from "sonner";
import { 
  ensurePhotosExist, 
  createOrder, 
  createOrderItems, 
  processPayment 
} from "@/utils/orderUtils";
import ShippingForm from "./ShippingForm";
import PaymentMethodSelect from "./PaymentMethodSelect";
import CheckoutHeader from "./checkout/CheckoutHeader";
import CheckoutButton from "./checkout/CheckoutButton";

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

  const selectedShippingMethod = shippingMethods.find(
    method => method.id === shippingMethod
  );

  const isPickupMethod = selectedShippingMethod?.type === "pickup";

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
        
        const shippingCost = selectedShippingMethod?.price || 0;
        const subtotal = order.total_amount - shippingCost;
        
        const orderItems = cart.map(item => ({
          name: "Fotografia",
          quantity: 1,
          price: item.price
        }));
        
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
                  total: order.total_amount,
                  shippingCost,
                  subtotal,
                  items: orderItems
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
                  amount: payment.amount,
                  shippingCost,
                  subtotal
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-gradient-soft rounded-xl shadow-sm p-4 md:p-8 space-y-6">
        <CheckoutHeader onBack={onBack} isProcessing={isProcessing} />

        <div className="space-y-8">
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

          <div className="pt-4">
            <CheckoutButton isProcessing={isProcessing} />
          </div>
        </div>
      </div>
    </form>
  );
};

export default CheckoutForm;