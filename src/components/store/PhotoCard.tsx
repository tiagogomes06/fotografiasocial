import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ProductSelect from "./ProductSelect";
import { Product } from "@/types/admin";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface PhotoCardProps {
  photo: string;
  isSelected: boolean;
  onSelect: (photoUrl: string) => void;
  selectedProducts?: { [key: string]: number };
  onProductSelect: (productId: string, quantity: number) => void;
  onProductDeselect: (productId: string) => void;
  products: Product[];
}

const PhotoCard = ({
  photo,
  isSelected,
  onSelect,
  selectedProducts = {},
  onProductSelect,
  onProductDeselect,
  products,
}: PhotoCardProps) => {
  const [showProducts, setShowProducts] = useState(false);

  const handleClick = () => {
    onSelect(photo);
    setShowProducts(true);
  };

  const handleProductSelect = (productId: string, quantity: number) => {
    if (quantity === 0) {
      onProductDeselect(productId);
    } else {
      onProductSelect(productId, quantity);
    }
  };

  return (
    <Card className="group overflow-hidden relative">
      <Dialog>
        <DialogTrigger asChild>
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
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-lg overflow-hidden">
              <img
                src={photo}
                alt="Fotografia"
                className="w-full h-full object-cover"
                onContextMenu={(e) => e.preventDefault()}
                draggable="false"
              />
            </div>
            <ProductSelect
              selectedProducts={selectedProducts}
              onProductSelect={handleProductSelect}
              products={products}
            />
          </div>
        </DialogContent>
      </Dialog>

      {isSelected && showProducts && (
        <div className="p-3 animate-in slide-in-from-top-2">
          <ProductSelect
            selectedProducts={selectedProducts}
            onProductSelect={handleProductSelect}
            products={products}
          />
        </div>
      )}
    </Card>
  );
};

export default PhotoCard;