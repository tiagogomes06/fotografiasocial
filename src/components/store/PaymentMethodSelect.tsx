import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
    },
    {
      id: "card",
      name: "Cartão de Crédito",
      image: "https://madduckjewels.com/wp-content/uploads/2019/09/Visa-MasterCard-300x175-300x175.png",
      description: "Pagamento seguro com cartão de crédito"
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Método de Pagamento</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => setPaymentMethod(method.id)}
            className={cn(
              "relative h-[200px] rounded-xl border-2 transition-all duration-200 overflow-hidden group",
              paymentMethod === method.id 
                ? "border-purple-500 shadow-lg" 
                : "border-gray-200 hover:border-purple-300"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 z-10" />
            <img 
              src={method.image} 
              alt={method.name}
              className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 z-20 p-4 flex flex-col justify-end text-white">
              <h3 className="text-lg font-semibold">{method.name}</h3>
              <p className="text-sm text-gray-200 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {method.description}
              </p>
            </div>
            {paymentMethod === method.id && (
              <div className="absolute top-4 right-4 z-30 bg-purple-500 rounded-full p-1">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelect;