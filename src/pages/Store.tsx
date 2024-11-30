import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PhotoCard from "@/components/store/PhotoCard";
import { CartItem, Product } from "@/types/admin";
import StoreHeader from "@/components/store/StoreHeader";
import StoreInstructions from "@/components/store/StoreInstructions";
import StoreBottomBar from "@/components/store/StoreBottomBar";

const Store = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { photos = [], studentName, studentId: initialStudentId } = location.state || {};
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [productSelections, setProductSelections] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      toast.error("Por favor, volte à página inicial e acesse suas fotos novamente");
      navigate('/');
    }
  }, [navigate]);

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("price");
      
      if (error) throw error;
      return data;
    },
  });

  const handlePhotoSelect = (photoUrl: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoUrl) 
        ? prev.filter(p => p !== photoUrl)
        : [...prev, photoUrl]
    );

    if (selectedPhotos.includes(photoUrl)) {
      setProductSelections(prev => {
        const newSelections = { ...prev };
        delete newSelections[photoUrl];
        return newSelections;
      });
    }
  };

  const handleProductSelect = (photoUrl: string, productId: string) => {
    setProductSelections(prev => ({
      ...prev,
      [photoUrl]: productId
    }));
  };

  const extractPhotoId = (photoUrl: string) => {
    const matches = photoUrl.match(/photos\/([^/]+)\.[^.]+$/);
    return matches ? matches[1] : null;
  };

  const getOrCreatePhoto = async (photoUrl: string, studentId: string) => {
    const photoId = extractPhotoId(photoUrl);
    if (!photoId) return null;

    try {
      const { data: existingPhoto, error } = await supabase
        .from("photos")
        .select("id")
        .eq("id", photoId)
        .maybeSingle();

      if (existingPhoto) {
        return existingPhoto.id;
      }

      const { data: newPhoto, error: createError } = await supabase
        .from("photos")
        .insert({
          id: photoId,
          url: photoUrl,
          student_id: studentId
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating photo:", createError);
        return null;
      }

      return newPhoto.id;
    } catch (error) {
      console.error("Error processing photo:", error);
      return null;
    }
  };

  const addToCart = async () => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      toast.error("Por favor, volte à página inicial e acesse suas fotos novamente");
      navigate('/');
      return;
    }

    const validItems: CartItem[] = [];
    
    for (const photo of selectedPhotos.filter(photo => productSelections[photo])) {
      const product = products.find(p => p.id === productSelections[photo]);
      const photoId = await getOrCreatePhoto(photo, studentId);
      
      if (!photoId) {
        toast.error(`Erro ao processar foto: ${photo}`);
        continue;
      }

      validItems.push({
        photoUrl: photo,
        photoId: photoId,
        productId: productSelections[photo],
        studentId: studentId,
        price: product?.price || 0
      });
    }

    if (validItems.length > 0) {
      const newCart = [...cart, ...validItems];
      setCart(newCart);
      setSelectedPhotos([]);
      setProductSelections({});
      toast.success("Itens adicionados ao carrinho");
    }
  };

  const handleCartNavigation = () => {
    navigate('/cart', { 
      state: { 
        cart,
        products 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <StoreHeader 
          cartItemCount={cart.length} 
          onCartClick={handleCartNavigation}
        />
        <StoreInstructions />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {photos.map((photo: string, index: number) => (
            <PhotoCard
              key={index}
              photo={photo}
              isSelected={selectedPhotos.includes(photo)}
              onSelect={handlePhotoSelect}
              selectedProduct={productSelections[photo]}
              onProductSelect={(productId) => handleProductSelect(photo, productId)}
              products={products}
            />
          ))}
        </div>

        {selectedPhotos.length > 0 && (
          <StoreBottomBar
            selectedCount={selectedPhotos.length}
            onAddToCart={addToCart}
            disabled={selectedPhotos.some(photo => !productSelections[photo])}
          />
        )}
      </div>
    </div>
  );
};

export default Store;