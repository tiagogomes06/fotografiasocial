import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import PhotoCard from "@/components/store/PhotoCard";
import { CartItem, Product } from "@/types/admin";

const Store = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { photos, studentName } = location.state || { photos: [], studentName: "" };
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [productSelections, setProductSelections] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<CartItem[]>([]);

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

  const addToCart = () => {
    const newItems = selectedPhotos
      .filter(photo => productSelections[photo])
      .map(photo => {
        const product = products.find(p => p.id === productSelections[photo]);
        return {
          photoUrl: photo,
          productId: productSelections[photo],
          price: product?.price || 0
        };
      });

    setCart(prev => [...prev, ...newItems]);
    setSelectedPhotos([]);
    setProductSelections({});
    toast.success("Itens adicionados ao carrinho");
  };

  const goToCart = () => {
    navigate('/cart', { state: { cart, products } });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          {cart.length > 0 && (
            <Button onClick={goToCart}>
              Ver Carrinho ({cart.length})
            </Button>
          )}
        </div>

        <div className="bg-muted/30 p-4 rounded-lg border border-border/50 mb-6">
          <p className="text-muted-foreground">
            Para fazer uma compra, clique na foto que deseja comprar e depois selecione o produto desejado no menu que aparece abaixo da foto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="fixed bottom-4 left-0 right-0 bg-background border-t p-4 shadow-lg z-10">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <span>{selectedPhotos.length} fotos selecionadas</span>
              <Button
                onClick={addToCart}
                disabled={selectedPhotos.some(photo => !productSelections[photo])}
              >
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Store;