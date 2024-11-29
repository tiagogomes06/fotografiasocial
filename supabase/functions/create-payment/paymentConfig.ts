export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface PaymentConfig {
  stripeKey: string;
}

export const getConfig = (): PaymentConfig => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }

  return {
    stripeKey,
  };
};