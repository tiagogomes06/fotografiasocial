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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductSelect(product.id)}
            className={cn(
              "relative rounded-xl transition-all duration-200 overflow-hidden group",
              "h-auto aspect-[4/3] p-4",
              selectedProduct === product.id 
                ? "ring-2 ring-purple-500 ring-offset-2" 
                : "hover:ring-2 hover:ring-purple-300 hover:ring-offset-1"
            )}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
            <div className="absolute inset-0 z-20 p-4 flex flex-col justify-end">
              <h3 className="text-base font-bold text-white drop-shadow-lg leading-snug">
                {product.name}
              </h3>
              <p className="text-lg font-semibold text-purple-100 mt-1.5 drop-shadow-lg">
                {product.price}€
              </p>
            </div>
            {selectedProduct === product.id && (
              <div className="absolute top-3 right-3 z-30 bg-white rounded-full p-1.5 shadow-lg">
                <Check className="w-4 h-4 text-purple-500" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductSelect;