import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                required={!isPickupMethod}
              />
            </div>

            <div>
              <Label htmlFor="postalCode">Código Postal</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                required={!isPickupMethod}
              />
            </div>

            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required={!isPickupMethod}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShippingForm;