import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import StoreHeader from "@/components/store/StoreHeader";
import StoreInstructions from "@/components/store/StoreInstructions";
import StoreBottomBar from "@/components/store/StoreBottomBar";
import PhotoGallery from "@/components/store/PhotoGallery";
import { useStore } from "@/components/store/useStore";

const Store = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { photos = [], studentName, studentId: initialStudentId } = location.state || {};
  
  const {
    selectedPhotos,
    productSelections,
    cart,
    products,
    handlePhotoSelect,
    handleProductSelect,
    handleProductDeselect,
    addToCart
  } = useStore();

  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      toast.error("Por favor, volte à página inicial e acesse suas fotos novamente");
      navigate('/');
    }
  }, [navigate]);

  const handleCartNavigation = () => {
    navigate('/cart', { 
      state: { 
        cart,
        products 
      } 
    });
  };

  // Calculate total selected products by summing up quantities
  const totalSelectedProducts = selectedPhotos.reduce((total, photoUrl) => {
    const photoSelections = productSelections[photoUrl] || {};
    const photoTotal = Object.values(photoSelections).reduce((sum, quantity) => sum + quantity, 0);
    return total + photoTotal;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <StoreHeader 
          cartItemCount={cart.length} 
          onCartClick={handleCartNavigation}
        />
        <StoreInstructions />
        
        <PhotoGallery
          photos={photos}
          selectedPhotos={selectedPhotos}
          productSelections={productSelections}
          products={products}
          onPhotoSelect={handlePhotoSelect}
          onProductSelect={handleProductSelect}
          onProductDeselect={handleProductDeselect}
        />

        {selectedPhotos.length > 0 && (
          <StoreBottomBar
            selectedCount={totalSelectedProducts}
            onAddToCart={addToCart}
            disabled={selectedPhotos.some(photo => 
              !productSelections[photo] || 
              Object.values(productSelections[photo]).every(quantity => quantity === 0)
            )}
          />
        )}
      </div>
    </div>
  );
};

export default Store;