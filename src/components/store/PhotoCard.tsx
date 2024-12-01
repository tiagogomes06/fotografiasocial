import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ProductSelect from "./ProductSelect";
import { Product } from "@/types/admin";
import { toast } from "sonner";

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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleClick = () => {
    if (!imageError) {
      onSelect(photo);
    }
  };

  const handleImageError = () => {
    const currentRetryCount = retryCount + 1;
    
    if (currentRetryCount < MAX_RETRIES) {
      setRetryCount(currentRetryCount);
      const img = new Image();
      img.src = photo + '?retry=' + new Date().getTime();
      img.onload = () => {
        setImageError(false);
        setRetryCount(0);
      };
      img.onerror = () => {
        if (currentRetryCount >= MAX_RETRIES) {
          console.error("Failed to load store image after retries:", photo);
          setImageError(true);
          toast.error("Erro ao carregar uma imagem. Por favor, tente novamente mais tarde.");
        } else {
          setRetryCount(currentRetryCount);
        }
      };
    } else {
      setImageError(true);
    }
  };

  const handleProductSelect = (productId: string, quantity: number) => {
    if (quantity === 0) {
      onProductDeselect(productId);
    } else {
      onProductSelect(productId, quantity);
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
                setRetryCount(0);
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
        <img
          src={photo}
          alt="Fotografia"
          className="w-full h-full object-cover"
          onContextMenu={(e) => e.preventDefault()}
          draggable="false"
          crossOrigin="anonymous"
          loading="lazy"
          onError={handleImageError}
        />
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm animate-in fade-in-0" />
        )}
      </div>

      {isSelected && (
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