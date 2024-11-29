import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types/admin";

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
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="relative group">
          <img
            src={photo}
            alt="Photo"
            className="w-full aspect-square object-cover rounded-md"
          />
          <div className="absolute top-2 left-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(photo)}
              className="bg-white/90"
            />
          </div>
        </div>
        
        {isSelected && (
          <Select
            value={selectedProduct}
            onValueChange={onProductSelect}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} - ${product.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoCard;