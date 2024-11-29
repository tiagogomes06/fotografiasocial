import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

interface CartItem {
  photoUrl: string;
  productId: string;
  price: number;
}

const Store = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { photos, studentName } = location.state || { photos: [], studentName: "" };
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [productSelections, setProductSelections] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data: products = [] } = useQuery<Product[]>({
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
    toast.success("Items added to cart");
  };

  const proceedToCheckout = () => {
    // TODO: Implement checkout process
    toast.info("Checkout functionality coming soon!");
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

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
            Back
          </Button>
          <Button
            onClick={() => proceedToCheckout()}
            disabled={cart.length === 0}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Checkout ({cart.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo: string, index: number) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4 space-y-4">
                <div className="relative aspect-square">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedPhotos.includes(photo)}
                      onCheckedChange={() => handlePhotoSelect(photo)}
                    />
                  </div>
                </div>
                
                {selectedPhotos.includes(photo) && (
                  <Select
                    value={productSelections[photo]}
                    onValueChange={(value) => handleProductSelect(photo, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ${product.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedPhotos.length > 0 && (
          <div className="fixed bottom-4 left-0 right-0 bg-background border-t p-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <span>{selectedPhotos.length} photos selected</span>
              <Button
                onClick={addToCart}
                disabled={selectedPhotos.some(photo => !productSelections[photo])}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>
              <div className="space-y-4">
                {cart.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.photoUrl}
                          alt={`Cart item ${index + 1}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{product?.name}</p>
                          <p className="text-sm text-muted-foreground">${item.price}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Store;