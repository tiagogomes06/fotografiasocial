import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/admin";
import { cn } from "@/lib/utils";
import ProductSelect from "./ProductSelect";

interface PhotoCardProps {
  photo: string;
  isSelected: boolean;
  onSelect: (photo: string) => void;
  selectedProduct: string | undefined;
  onProductSelect: (productId: string) => void;
  products: Product[];
}

const PhotoCard = ({
  photo,
  isSelected,
  onSelect,
  selectedProduct,
  onProductSelect,
  products,
}: PhotoCardProps) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 bg-white/95 backdrop-blur-sm hover:shadow-lg rounded-xl",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={() => onSelect(photo)}
    >
      <CardContent className="p-4 space-y-4">
        <div 
          className={cn(
            "relative group cursor-pointer w-full aspect-square rounded-lg transition-all duration-300",
            "bg-gradient-to-br from-purple-100 via-purple-50 to-white",
            isSelected ? "opacity-100" : "hover:opacity-90"
          )}
        >
          <div 
            className={cn(
              "absolute inset-0 rounded-lg transition-opacity duration-300",
              isSelected ? "opacity-0" : "group-hover:opacity-100",
              "bg-gradient-to-t from-black/10 to-transparent"
            )}
          />
        </div>
        
        {isSelected && (
          <div 
            className="animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <ProductSelect
              selectedProduct={selectedProduct}
              onProductSelect={onProductSelect}
              products={products}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoCard;