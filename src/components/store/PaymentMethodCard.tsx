import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PaymentMethodCardProps {
  id: string;
  name: string;
  image: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

const PaymentMethodCard = ({
  id,
  name,
  image,
  description,
  selected,
  onSelect
}: PaymentMethodCardProps) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative h-[180px] rounded-xl border-2 transition-all duration-200 overflow-hidden group w-full",
        selected 
          ? "border-primary shadow-lg ring-2 ring-primary/20" 
          : "border-gray-200 hover:border-primary/60"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 z-10" />
      <img 
        src={image} 
        alt={name}
        className="absolute inset-0 w-full h-full object-contain p-6 transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 z-20 p-4 flex flex-col justify-end text-white">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-gray-200 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {description}
        </p>
      </div>
      {selected && (
        <div className="absolute top-4 right-4 z-30 bg-primary rounded-full p-1.5">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </button>
  );
};

export default PaymentMethodCard;