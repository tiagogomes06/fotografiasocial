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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Escolha um produto:</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductSelect(product.id)}
            className={cn(
              "w-full group relative flex items-center p-4 rounded-lg transition-all duration-200",
              "bg-gradient-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20",
              selectedProduct === product.id 
                ? "ring-2 ring-purple-500 ring-offset-2 bg-purple-500/20" 
                : "hover:ring-1 hover:ring-purple-300"
            )}
          >
            <div className="flex-1 text-left">
              <h3 className="font-medium text-gray-900">
                {product.name}
              </h3>
              <p className="text-lg font-semibold text-purple-600 mt-1">
                {product.price}€
              </p>
            </div>
            
            <div className={cn(
              "ml-4 rounded-full p-2 transition-colors",
              selectedProduct === product.id 
                ? "bg-purple-500 text-white"
                : "bg-white/50 text-purple-500"
            )}>
              <Check className="w-5 h-5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductSelect;