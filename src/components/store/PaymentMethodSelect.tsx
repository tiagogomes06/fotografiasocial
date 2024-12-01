import PaymentMethodCard from "./PaymentMethodCard";

interface PaymentMethodSelectProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

const PaymentMethodSelect = ({ paymentMethod, setPaymentMethod }: PaymentMethodSelectProps) => {
  const paymentMethods = [
    {
      id: "mbway",
      name: "MBWay",
      image: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Logo_MBWay.svg",
      description: "Pagamento instantâneo através do seu telemóvel"
    },
    {
      id: "multibanco",
      name: "Multibanco",
      image: "https://i0.wp.com/contaonline.pt/wp-content/uploads/2022/06/Empresas-de-sucesso-controlo-de-tesouraria-multibanco-contaonline.png",
      description: "Pagamento por referência multibanco"
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold">Método de Pagamento</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            {...method}
            selected={paymentMethod === method.id}
            onSelect={() => setPaymentMethod(method.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelect;