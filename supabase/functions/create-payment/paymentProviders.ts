import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

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

  if (order.shipping_method_id) {
    const shippingMethod = order.shipping_method;
    if (shippingMethod && shippingMethod.price > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Shipping',
            description: shippingMethod.name,
          },
          unit_amount: Math.round(shippingMethod.price * 100),
        },
        quantity: 1,
      });
    }
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
  console.log('Creating EuPago MBWay payment');
  
  const response = await fetch('https://clientes.eupago.pt/api/v1.02/mbway/create', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'Authorization': `ApiKey ${apiKey}`,
    },
    body: JSON.stringify({
      payment: {
        identifier: order.id,
        amount: {
          value: order.total_amount,
          currency: 'EUR'
        },
        successUrl: `${origin}/payment-success`,
        failUrl: `${origin}/payment-cancelled`,
        backUrl: `${origin}/cart`,
        lang: 'PT'
      },
      customer: {
        notify: true,
        phone: order.shipping_phone,
        name: order.shipping_name,
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('EuPago MBWay error:', errorText);
    throw new Error(`EuPago error: ${errorText}`);
  }

  const result = await response.json();
  console.log('EuPago MBWay response:', result);
  return result;
};

export const createEupagoMultibancoPayment = async (
  order: any,
  apiKey: string
): Promise<PaymentResponse> => {
  console.log('Creating EuPago Multibanco payment');
  
  const response = await fetch('https://clientes.eupago.pt/clientes/rest_api/pagamento/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `ApiKey ${apiKey}`,
    },
    body: JSON.stringify({
      payment_method: 'multibanco',
      valor: order.total_amount,
      chave: apiKey,
      id: order.id,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('EuPago Multibanco error:', errorText);
    throw new Error(`EuPago error: ${errorText}`);
  }

  const result = await response.json();
  console.log('EuPago Multibanco response:', result);
  return result;
};