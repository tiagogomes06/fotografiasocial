import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartItem } from "@/types/admin";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  ensurePhotosExist, 
  createOrder, 
  createOrderItems, 
  processPayment 
} from "@/utils/orderUtils";

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  wantsInvoice: boolean;
  taxNumber: string;
}

export const useCheckoutForm = (cart: CartItem[]) => {
  const navigate = useNavigate();
  const [shippingMethod, setShippingMethod] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    postalCode: "",
    city: "",
    wantsInvoice: false,
    taxNumber: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

    if (formData.wantsInvoice && !formData.taxNumber) {
      toast.error("Por favor preencha o NIF para emissão da fatura");
      return;
    }

    const selectedShippingMethod = await supabase
      .from("shipping_methods")
      .select("*")
      .eq("id", shippingMethod)
      .single();

    const isPickupMethod = selectedShippingMethod.data?.type === "pickup";

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
        
        const shippingCost = selectedShippingMethod?.data?.price || 0;
        const subtotal = order.total_amount - shippingCost;
        
        const orderItems = cart.map(item => ({
          name: "Fotografia",
          quantity: item.quantity || 1,
          price: item.price
        }));

        const orderDetails = {
          orderId: order.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          shippingMethod: selectedShippingMethod?.data?.name,
          total: order.total_amount,
          items: orderItems,
          shippingCost,
          taxNumber: formData.wantsInvoice ? formData.taxNumber : null
        };

        // Send order confirmation email for all payment methods except card
        try {
          await supabase.functions.invoke('send-order-email', {
            body: { 
              orderId: order.id,
              type: 'created'
            }
          });
        } catch (emailError) {
          console.error('Error sending order confirmation email:', emailError);
          toast.error('Erro ao enviar email de confirmação');
        }
        
        if (paymentMethod === "mbway") {
          if (payment.error) {
            toast.error(`Erro MBWay: ${payment.error}`, {
              duration: 10000
            });
          } else {
            navigate("/mbway-confirmation", {
              state: { orderDetails }
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
                orderDetails,
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

  return {
    shippingMethod,
    setShippingMethod,
    formData,
    setFormData,
    paymentMethod,
    setPaymentMethod,
    isProcessing,
    handleSubmit
  };
};