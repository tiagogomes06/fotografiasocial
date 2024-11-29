import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentMethodSelectProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

const PaymentMethodSelect = ({ paymentMethod, setPaymentMethod }: PaymentMethodSelectProps) => {
  return (
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
  );
};

export default PaymentMethodSelect;