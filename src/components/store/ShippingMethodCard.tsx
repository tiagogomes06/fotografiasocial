import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ShippingMethodCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  selected: boolean;
  onSelect: () => void;
}

const ShippingMethodCard = ({
  id,
  name,
  description,
  price,
  selected,
  onSelect
}: ShippingMethodCardProps) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative h-[120px] rounded-xl border-2 transition-all duration-200 overflow-hidden w-full p-4 text-left",
        selected 
          ? "border-primary shadow-lg ring-2 ring-primary/20" 
          : "border-gray-200 hover:border-primary/60"
      )}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          <h3 className="font-semibold flex items-center justify-between">
            <span>{name}</span>
            <span className="text-sm text-gray-600">{price > 0 ? `${price}€` : "Grátis"}</span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
      {selected && (
        <div className="absolute top-2 right-2">
          <Check className="w-4 h-4 text-primary" />
        </div>
      )}
    </button>
  );
};

export default ShippingMethodCard;