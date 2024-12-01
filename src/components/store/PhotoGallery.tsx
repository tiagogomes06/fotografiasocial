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
  // Process photos to ensure S3 URLs
  const processedPhotos = photos.map(photo => {
    if (photo.includes('supabase')) {
      // Extract filename from Supabase URL
      const filename = photo.split('/').pop();
      // Construct S3 URL
      return `https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/photos/${filename}`;
    }
    return photo;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
      {processedPhotos.map((photo: string, index: number) => (
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