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
  onQuantityChange?: (quantity: number) => void;
}

const PhotoCard = ({
  photo,
  isSelected,
  onSelect,
  selectedProduct,
  onProductSelect,
  products,
  quantity = 1,
  onQuantityChange
}: PhotoCardProps) => {
  const [showProducts, setShowProducts] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(quantity);

  const handleClick = () => {
    onSelect(photo);
    setShowProducts(true);
  };

  const handleProductSelect = (productId: string, newQuantity: number) => {
    setCurrentQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(newQuantity);
    }
    onProductSelect(productId, newQuantity);
  };

  return (
    <Card className="group overflow-hidden relative">
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
          onContextMenu={(e) => e.preventDefault()}
          draggable="false"
        />
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm animate-in fade-in-0" />
        )}
      </div>

      {isSelected && showProducts && (
        <div className="p-3 animate-in slide-in-from-top-2">
          <ProductSelect
            selectedProduct={selectedProduct}
            onProductSelect={handleProductSelect}
            products={products}
            quantity={currentQuantity}
          />
        </div>
      )}
    </Card>
  );
};

export default PhotoCard;