import { cn } from "@/lib/utils";
import { Check, Minus, Plus } from "lucide-react";
import { Product } from "@/types/admin";
import { Button } from "@/components/ui/button";

interface ProductSelectProps {
  selectedProducts: { [key: string]: number };
  onProductSelect: (productId: string, quantity: number) => void;
  products: Product[];
}

const ProductSelect = ({ 
  selectedProducts, 
  onProductSelect, 
  products,
}: ProductSelectProps) => {
  const handleQuantityChange = (productId: string, change: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentQuantity = selectedProducts[productId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    onProductSelect(productId, newQuantity);
  };

  const handleProductClick = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentQuantity = selectedProducts[productId] || 0;
    const newQuantity = currentQuantity === 0 ? 1 : 0;
    onProductSelect(productId, newQuantity);
  };

  return (
    <div className="space-y-3 animate-fade-up">
      <h2 className="text-sm font-medium text-muted-foreground">Escolha os produtos:</h2>
      <div className="grid grid-cols-1 gap-2">
        {products.map((product) => {
          const quantity = selectedProducts[product.id] || 0;
          const isSelected = quantity > 0;
          
          return (
            <div
              key={product.id}
              onClick={(e) => handleProductClick(product.id, e)}
              className={cn(
                "relative p-3 rounded-lg text-left transition-all duration-200 cursor-pointer",
                "bg-white/50 hover:bg-white shadow-sm border border-border/50",
                isSelected && "ring-2 ring-primary bg-white"
              )}
            >
              <div className="flex justify-between items-center gap-3">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground text-sm leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-primary font-semibold text-sm mt-0.5">
                    {product.price}€
                  </p>
                  
                  {isSelected && (
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleQuantityChange(product.id, -1, e)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleQuantityChange(product.id, 1, e)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className={cn(
                  "rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 transition-colors duration-200",
                  isSelected 
                    ? "bg-primary text-primary-foreground"
                    : "bg-white ring-1 ring-border"
                )}>
                  <Check className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductSelect;