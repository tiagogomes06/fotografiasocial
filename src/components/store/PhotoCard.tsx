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
    >
      <CardContent className="p-0">
        <div 
          className="relative group cursor-pointer"
          onClick={() => onSelect(photo)}
        >
          <img
            src={photo}
            alt="Foto"
            className="w-full aspect-square object-cover transition-all duration-300 group-hover:opacity-90"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
        
        {isSelected && (
          <div 
            className="animate-fade-in p-4"
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