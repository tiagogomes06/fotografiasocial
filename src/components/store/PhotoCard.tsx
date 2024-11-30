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
        "overflow-hidden transition-all duration-300 bg-white/95 backdrop-blur-sm hover:shadow-lg rounded-xl",
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
              "w-full aspect-square object-cover rounded-lg transition-all duration-300",
              isSelected ? "opacity-100" : "hover:opacity-90 group-hover:scale-105"
            )}
          />
          {!isSelected && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-lg" />
          )}
        </div>
        
        {isSelected && (
          <div 
            className="animate-fade-in" 
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h4 className="text-sm font-medium mb-2 text-gray-700">Escolha um produto:</h4>
            <Select
              value={selectedProduct}
              onValueChange={(value) => {
                onProductSelect(value);
              }}
            >
              <SelectTrigger 
                className="w-full bg-white"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent 
                className="bg-white border shadow-lg"
                onPointerDownOutside={(e) => e.preventDefault()}
              >
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