import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ShippingMethodCard from "./ShippingMethodCard";

interface ShippingFormProps {
  formData: {
    name: string;
    phone: string;
    email: string;
    address: string;
    postalCode: string;
    city: string;
  };
  setFormData: (data: any) => void;
  shippingMethod: string;
  setShippingMethod: (method: string) => void;
  shippingMethods: any[];
  isPickupMethod: boolean;
}

const ShippingForm = ({
  formData,
  setFormData,
  shippingMethod,
  setShippingMethod,
  shippingMethods,
  isPickupMethod,
}: ShippingFormProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold">Dados de Envio</h2>
      
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            placeholder="912 345 678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>

        <div className="space-y-4">
          <Label>Método de Envio</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shippingMethods.map((method) => (
              <ShippingMethodCard
                key={method.id}
                id={method.id}
                name={method.name}
                description={method.description || ""}
                price={method.price}
                selected={shippingMethod === method.id}
                onSelect={() => setShippingMethod(method.id)}
              />
            ))}
          </div>
        </div>

        {!isPickupMethod && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="address">Morada</Label>
              <Input
                id="address"
                placeholder="Sua morada completa"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required={!isPickupMethod}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Código Postal</Label>
                <Input
                  id="postalCode"
                  placeholder="1234-567"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  required={!isPickupMethod}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="Sua cidade"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required={!isPickupMethod}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingForm;