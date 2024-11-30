import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Product } from "@/types/admin";

interface ProductSelectProps {
  selectedProduct: string | undefined;
  onProductSelect: (productId: string) => void;
  products: Product[];
}

const ProductSelect = ({ selectedProduct, onProductSelect, products }: ProductSelectProps) => {
  // Function to get a gradient based on index
  const getGradient = (index: number) => {
    const gradients = [
      "bg-gradient-to-br from-purple-500 to-indigo-600",
      "bg-gradient-to-br from-pink-500 to-rose-600",
      "bg-gradient-to-br from-blue-500 to-cyan-600",
      "bg-gradient-to-br from-emerald-500 to-teal-600",
      "bg-gradient-to-br from-orange-500 to-amber-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Escolha um produto:</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {products.map((product, index) => (
          <button
            key={product.id}
            onClick={() => onProductSelect(product.id)}
            className={cn(
              "relative h-[140px] rounded-xl transition-all duration-200 overflow-hidden group",
              selectedProduct === product.id 
                ? "ring-2 ring-purple-500 ring-offset-2" 
                : "hover:ring-2 hover:ring-purple-300 hover:ring-offset-1"
            )}
          >
            <div 
              className={cn(
                "absolute inset-0 transition-transform duration-300 group-hover:scale-105",
                getGradient(index)
              )} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
            <div className="absolute inset-0 z-20 p-3 flex flex-col justify-end text-white">
              <h3 className="text-sm font-semibold drop-shadow-md">{product.name}</h3>
              <p className="text-sm text-gray-100 mt-1 drop-shadow-md">
                {product.price}€
              </p>
            </div>
            {selectedProduct === product.id && (
              <div className="absolute top-2 right-2 z-30 bg-white rounded-full p-1">
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