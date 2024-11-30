export interface OrderDetails {
  id: string;
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  email: string | null;
  shipping_phone: string | null;
  payment_method: string | null;
  total_amount: number;
  shipping_methods: {
    name: string;
    price: number;
  };
  order_items: Array<{
    quantity: number;
    price_at_time: number;
    products: {
      name: string;
    };
    photos: {
      url: string;
    };
  }>;
}