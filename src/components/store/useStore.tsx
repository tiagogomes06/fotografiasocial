import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CartItem, Product } from "@/types/admin";
import { toast } from "sonner";

export const useStore = () => {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [productSelections, setProductSelections] = useState<{
    [photoUrl: string]: {
      [productId: string]: number;
    };
  }>({});
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

  const handleProductSelect = (photoUrl: string, productId: string, quantity: number) => {
    setProductSelections(prev => ({
      ...prev,
      [photoUrl]: {
        ...(prev[photoUrl] || {}),
        [productId]: quantity
      }
    }));
  };

  const handleProductDeselect = (photoUrl: string, productId: string) => {
    setProductSelections(prev => {
      const photoSelections = { ...prev[photoUrl] };
      delete photoSelections[productId];
      
      if (Object.keys(photoSelections).length === 0) {
        const newSelections = { ...prev };
        delete newSelections[photoUrl];
        return newSelections;
      }
      
      return {
        ...prev,
        [photoUrl]: photoSelections
      };
    });
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
      return false;
    }

    const validItems: CartItem[] = [];
    
    for (const photoUrl of selectedPhotos) {
      const photoSelections = productSelections[photoUrl] || {};
      const photoId = await getOrCreatePhoto(photoUrl, studentId);
      
      if (!photoId) {
        toast.error(`Erro ao processar foto: ${photoUrl}`);
        continue;
      }

      for (const [productId, quantity] of Object.entries(photoSelections)) {
        if (quantity > 0) {
          const product = products.find(p => p.id === productId);
          if (product) {
            validItems.push({
              photoUrl,
              photoId,
              productId,
              studentId,
              price: product.price,
              quantity
            });
          }
        }
      }
    }

    if (validItems.length > 0) {
      const newCart = [...cart, ...validItems];
      setCart(newCart);
      setSelectedPhotos([]);
      setProductSelections({});
      toast.success("Itens adicionados ao carrinho");
      return true;
    }
    return false;
  };

  return {
    selectedPhotos,
    productSelections,
    cart,
    products,
    handlePhotoSelect,
    handleProductSelect,
    handleProductDeselect,
    addToCart,
    setCart
  };
};