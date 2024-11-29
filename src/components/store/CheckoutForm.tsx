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

    toast.success("Pedido criado com sucesso!");
    // TODO: Implement order creation and payment processing
    navigate("/");
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
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar ao Carrinho
        </Button>
        <Button type="submit">
          Finalizar Compra
        </Button>
      </div>
    </form>
  );
};

export default CheckoutForm;