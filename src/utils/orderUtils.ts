import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/admin";
import { toast } from "sonner";

export const ensurePhotosExist = async (cart: CartItem[]) => {
  for (const item of cart) {
    const { data: existingPhotos, error: queryError } = await supabase
      .from("photos")
      .select("id")
      .eq("id", item.photoId)
      .maybeSingle(); // Using maybeSingle() instead of single() to handle no results

    if (queryError) {
      throw new Error(`Failed to query photo: ${queryError.message}`);
    }

    if (!existingPhotos) {
      const { error: createError } = await supabase
        .from("photos")
        .insert({
          id: item.photoId,
          url: item.photoUrl,
          student_id: item.studentId
        });

      if (createError) {
        throw new Error(`Failed to create photo: ${createError.message}`);
      }
    }
  }
};

export const createOrder = async (
  cart: CartItem[],
  studentId: string,
  shippingMethod: string,
  formData: {
    address: string;
    city: string;
    postalCode: string;
    name: string;
    phone: string;
    email: string;
  },
  paymentMethod: string
) => {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      student_id: studentId,
      total_amount: cart.reduce((sum, item) => sum + item.price, 0),
      shipping_method_id: shippingMethod,
      shipping_address: formData.address,
      shipping_city: formData.city,
      shipping_postal_code: formData.postalCode,
      shipping_name: formData.name,
      shipping_phone: formData.phone,
      email: formData.email,
      payment_method: paymentMethod,
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  return order;
};

export const createOrderItems = async (cart: CartItem[], orderId: string) => {
  const orderItems = cart.map(item => ({
    order_id: orderId,
    photo_id: item.photoId,
    product_id: item.productId,
    price_at_time: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }
};

export const processPayment = async (
  orderId: string,
  paymentMethod: string,
  email: string,
  name: string
) => {
  const { data: payment, error: paymentError } = await supabase.functions.invoke("create-payment", {
    body: { 
      orderId, 
      paymentMethod,
      email,
      name,
    },
  });

  if (paymentError) {
    throw new Error(`Failed to process payment: ${paymentError.message}`);
  }

  return payment;
};