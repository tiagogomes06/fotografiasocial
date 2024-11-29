import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types/admin";
import { cn } from "@/lib/utils";

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
        "overflow-hidden transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={() => onSelect(photo)}
    >
      <CardContent className="p-4 space-y-4">
        <div className="relative group cursor-pointer">
          <img
            src={photo}
            alt="Foto"
            className={cn(
              "w-full aspect-square object-cover rounded-md transition-opacity",
              isSelected ? "opacity-100" : "hover:opacity-90"
            )}
          />
        </div>
        
        {isSelected && (
          <div className="animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-sm font-medium mb-2">Escolha um produto:</h4>
            <Select
              value={selectedProduct}
              onValueChange={onProductSelect}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                {products.map((product) => (
                  <SelectItem 
                    key={product.id} 
                    value={product.id}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {product.name} - {product.price}€
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoCard;