import { CartItem } from "@/types/admin";
import ShippingForm from "./ShippingForm";
import PaymentMethodSelect from "./PaymentMethodSelect";
import CheckoutHeader from "./checkout/CheckoutHeader";
import CheckoutButton from "./checkout/CheckoutButton";
import { useCheckoutForm } from "@/hooks/useCheckoutForm";
import { useCheckoutQueries } from "@/hooks/useCheckoutQueries";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

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

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wantsInvoice"
                checked={formData.wantsInvoice}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, wantsInvoice: checked === true })
                }
              />
              <Label htmlFor="wantsInvoice">Pretendo fatura com NIF</Label>
            </div>

            {formData.wantsInvoice && (
              <div className="space-y-2">
                <Label htmlFor="taxNumber">Número de Contribuinte (NIF)</Label>
                <Input
                  id="taxNumber"
                  placeholder="123456789"
                  value={formData.taxNumber || ''}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  required={formData.wantsInvoice}
                />
              </div>
            )}
          </div>

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