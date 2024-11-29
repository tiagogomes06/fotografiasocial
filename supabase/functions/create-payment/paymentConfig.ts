export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface PaymentConfig {
  stripeKey: string;
  eupagoKey: string;
}

export const getConfig = (): PaymentConfig => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }

  // Using hardcoded EuPago key as previously established
  const eupagoKey = 'da58-5a0d-2f22-0152-8f6d';

  return {
    stripeKey,
    eupagoKey,
  };
};