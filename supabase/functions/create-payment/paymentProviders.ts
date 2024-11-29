import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'
import { corsHeaders } from './paymentConfig.ts'

export interface PaymentResponse {
  sessionId?: string;
  url?: string;
  reference?: string;
  entity?: string;
  amount?: number;
  error?: string;
}

export const createStripePayment = async (
  stripe: Stripe,
  order: any,
  origin: string
): Promise<PaymentResponse> => {
  console.log('Creating Stripe payment session');
  
  const lineItems = order.order_items.map((item: any) => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.products.name,
        description: `Photo print for ${order.students.name}`,
      },
      unit_amount: Math.round(item.price_at_time * 100),
    },
    quantity: 1,
  }));

  if (order.shipping_methods && order.shipping_methods.price > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Shipping',
          description: order.shipping_methods.name,
        },
        unit_amount: Math.round(order.shipping_methods.price * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/payment-cancelled`,
    metadata: {
      order_id: order.id,
    },
  });

  return { 
    sessionId: session.id,
    url: session.url 
  };
};

export const createEupagoMBWayPayment = async (
  order: any,
  origin: string,
  apiKey: string
): Promise<PaymentResponse> => {
  console.log('Creating EuPago MBWay payment for order:', order.id);

  const payload = {
    payment: {
      amount: {
        currency: 'EUR',
        value: order.total_amount
      },
      identifier: order.id,
      successUrl: `${origin}/payment-success`,
      failUrl: `${origin}/payment-cancelled`,
      backUrl: `${origin}/cart`,
      lang: 'PT',
      customerPhone: order.shipping_phone,
      countryCode: '+351'
    },
    customer: {
      notify: true,
      email: order.email,
      name: order.shipping_name
    }
  };

  try {
    const response = await fetch('https://clientes.eupago.pt/api/v1.02/mbway/create', {
      method: 'POST',
      headers: {
        'Authorization': 'ApiKey da58-5a0d-2f22-0152-8f6d',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('EuPago MBWay error response:', errorText);
      throw new Error(`EuPago error: ${errorText}`);
    }

    const result = await response.json();
    console.log('EuPago MBWay success response:', result);
    return result;
  } catch (error) {
    console.error('Error processing EuPago MBWay payment:', error);
    throw error;
  }
};

export const createEupagoMultibancoPayment = async (
  order: any, 
  apiKey: string
): Promise<PaymentResponse> => {
  console.log('Creating EuPago Multibanco payment for order:', order.id);

  const payload = {
    payment_method: 'multibanco',
    valor: order.total_amount,
    chave: 'da58-5a0d-2f22-0152-8f6d',
    id: order.id
  };

  try {
    const response = await fetch('https://clientes.eupago.pt/clientes/rest_api/pagamento/create', {
      method: 'POST',
      headers: {
        'Authorization': 'ApiKey da58-5a0d-2f22-0152-8f6d',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('EuPago Multibanco error response:', errorText);
      throw new Error(`EuPago error: ${errorText}`);
    }

    const result = await response.json();
    console.log('EuPago Multibanco success response:', result);
    return result;
  } catch (error) {
    console.error('Error processing EuPago Multibanco payment:', error);
    throw error;
  }
};