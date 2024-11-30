import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ProductSelect from "./ProductSelect";
import { Product } from "@/types/admin";

interface PhotoCardProps {
  photo: string;
  isSelected: boolean;
  onSelect: (photoUrl: string) => void;
  selectedProduct?: string;
  onProductSelect: (productId: string, quantity: number) => void;
  products: Product[];
  quantity?: number;
}

const PhotoCard = ({
  photo,
  isSelected,
  onSelect,
  selectedProduct,
  onProductSelect,
  products,
  quantity = 1
}: PhotoCardProps) => {
  const [showProducts, setShowProducts] = useState(false);

  const handleClick = () => {
    onSelect(photo);
    setShowProducts(true);
  };

  return (
    <Card className="overflow-hidden group relative">
      <div
        className={cn(
          "aspect-square relative cursor-pointer",
          "after:absolute after:inset-0 after:bg-foreground/5 after:opacity-0 hover:after:opacity-100 after:transition-opacity"
        )}
        onClick={handleClick}
      >
        <img
          src={photo}
          alt="Fotografia"
          className="w-full h-full object-cover"
        />
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm animate-in fade-in-0" />
        )}
      </div>

      {isSelected && showProducts && (
        <div className="p-3 animate-in slide-in-from-top-2">
          <ProductSelect
            selectedProduct={selectedProduct}
            onProductSelect={onProductSelect}
            products={products}
            quantity={quantity}
          />
        </div>
      )}
    </Card>
  );
};

export default PhotoCard;