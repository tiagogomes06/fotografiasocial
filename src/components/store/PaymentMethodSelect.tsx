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
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&auto=format&fit=crop&q=60",
      description: "Pagamento instantâneo através do seu telemóvel"
    },
    {
      id: "multibanco",
      name: "Multibanco",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=60",
      description: "Pagamento por referência multibanco"
    },
    {
      id: "card",
      name: "Cartão de Crédito",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60",
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
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
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