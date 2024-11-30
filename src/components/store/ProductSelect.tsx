import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Product } from "@/types/admin";

interface ProductSelectProps {
  selectedProduct: string | undefined;
  onProductSelect: (productId: string) => void;
  products: Product[];
}

const ProductSelect = ({ selectedProduct, onProductSelect, products }: ProductSelectProps) => {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-gray-700">Escolha um produto:</h2>
      <div className="grid grid-cols-1 gap-2">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductSelect(product.id)}
            className={cn(
              "relative p-3 rounded-lg text-left transition-all duration-200",
              "bg-purple-50/50 hover:bg-purple-100/80",
              selectedProduct === product.id && "ring-2 ring-purple-500 bg-purple-100"
            )}
          >
            <div className="flex justify-between items-center gap-3">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm leading-tight">
                  {product.name}
                </h3>
                <p className="text-purple-600 font-semibold text-sm mt-0.5">
                  {product.price}€
                </p>
              </div>
              
              <div className={cn(
                "rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0",
                selectedProduct === product.id 
                  ? "bg-purple-500 text-white"
                  : "bg-white ring-1 ring-purple-200"
              )}>
                <Check className="w-3 h-3" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductSelect;