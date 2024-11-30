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
              "relative h-[140px] rounded-xl border-2 transition-all duration-200 overflow-hidden group",
              selectedProduct === product.id 
                ? "border-purple-500 shadow-lg" 
                : "border-gray-200 hover:border-purple-300"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 z-10" />
            <img 
              src={product.image_url || 'https://placehold.co/400x300/purple/white?text=Product'} 
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 z-20 p-3 flex flex-col justify-end text-white">
              <h3 className="text-sm font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-200 mt-1">
                {product.price}€
              </p>
            </div>
            {selectedProduct === product.id && (
              <div className="absolute top-2 right-2 z-30 bg-purple-500 rounded-full p-1">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductSelect;