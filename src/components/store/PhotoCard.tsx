import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ProductSelect from "./ProductSelect";
import { Product } from "@/types/admin";
import { toast } from "sonner";
import RetryImage from "../RetryImage";

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
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (!imageError) {
      onSelect(photo);
    }
  };

  if (imageError) {
    return (
      <Card className="group overflow-hidden relative">
        <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-500 p-4 text-center">
          <p>
            Não foi possível carregar esta imagem.
            <button 
              onClick={() => {
                setImageError(false);
              }}
              className="block mt-2 text-primary hover:underline"
            >
              Tentar novamente
            </button>
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden relative">
      <div
        className={cn(
          "aspect-square relative cursor-pointer",
          "after:absolute after:inset-0 after:bg-foreground/5 after:opacity-0 hover:after:opacity-100 after:transition-opacity"
        )}
        onClick={handleClick}
      >
        <RetryImage
          src={photo}
          alt="Fotografia"
          className="w-full h-full object-cover"
          onContextMenu={(e) => e.preventDefault()}
          draggable="false"
          crossOrigin="anonymous"
          loading="eager"
          onLoadError={() => {
            setImageError(true);
            toast.error("Não foi possível carregar a imagem");
          }}
          maxRetries={5}
          retryDelay={1000}
        />
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm animate-in fade-in-0" />
        )}
      </div>

      {isSelected && (
        <div className="p-3 animate-in slide-in-from-top-2">
          <ProductSelect
            selectedProducts={selectedProducts}
            onProductSelect={onProductSelect}
            products={products}
          />
        </div>
      )}
    </Card>
  );
};

export default PhotoCard;