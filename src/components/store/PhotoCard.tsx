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
        "group overflow-hidden transition-all duration-300 bg-white/95 backdrop-blur-sm hover:shadow-lg rounded-xl border-border/50",
        isSelected && "ring-2 ring-primary ring-offset-2",
        "animate-fade-up"
      )}
    >
      <CardContent className="p-0">
        <div 
          className="relative cursor-pointer overflow-hidden"
          onClick={() => onSelect(photo)}
        >
          <img
            src={photo}
            alt="Foto"
            className="w-full aspect-square object-cover transition-all duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {isSelected && (
          <div 
            className="animate-fade-in p-4 bg-gradient-soft"
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