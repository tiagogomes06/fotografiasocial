import PhotoCard from "./PhotoCard";
import { Product } from "@/types/admin";

interface PhotoGalleryProps {
  photos: string[];
  selectedPhotos: string[];
  productSelections: {
    [photoUrl: string]: {
      [productId: string]: number;
    };
  };
  products: Product[];
  onPhotoSelect: (photoUrl: string) => void;
  onProductSelect: (photoUrl: string, productId: string, quantity: number) => void;
  onProductDeselect: (photoUrl: string, productId: string) => void;
}

const PhotoGallery = ({
  photos,
  selectedPhotos,
  productSelections,
  products,
  onPhotoSelect,
  onProductSelect,
  onProductDeselect,
}: PhotoGalleryProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
      {photos.map((photo: string, index: number) => (
        <PhotoCard
          key={index}
          photo={photo}
          isSelected={selectedPhotos.includes(photo)}
          onSelect={onPhotoSelect}
          selectedProducts={productSelections[photo] || {}}
          onProductSelect={(productId, quantity) => 
            onProductSelect(photo, productId, quantity)
          }
          onProductDeselect={(productId) => 
            onProductDeselect(photo, productId)
          }
          products={products}
        />
      ))}
    </div>
  );
};

export default PhotoGallery;