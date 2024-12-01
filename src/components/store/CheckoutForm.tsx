import { CartItem } from "@/types/admin";
import ShippingForm from "./ShippingForm";
import PaymentMethodSelect from "./PaymentMethodSelect";
import CheckoutHeader from "./checkout/CheckoutHeader";
import CheckoutButton from "./checkout/CheckoutButton";
import { useCheckoutForm } from "@/hooks/useCheckoutForm";
import { useCheckoutQueries } from "@/hooks/useCheckoutQueries";

interface CheckoutFormProps {
  cart: CartItem[];
  onBack: () => void;
}

const CheckoutForm = ({ cart }: CheckoutFormProps) => {
  const { shippingMethods, products } = useCheckoutQueries();
  const {
    shippingMethod,
    setShippingMethod,
    formData,
    setFormData,
    paymentMethod,
    setPaymentMethod,
    isProcessing,
    handleSubmit
  } = useCheckoutForm(cart);

  const selectedShippingMethod = shippingMethods.find(
    method => method.id === shippingMethod
  );

  const isPickupMethod = selectedShippingMethod?.type === "pickup";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <CheckoutHeader isProcessing={isProcessing} />

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