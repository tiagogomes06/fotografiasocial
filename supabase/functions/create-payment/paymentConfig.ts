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
  const eupagoKey = Deno.env.get('EUPAGO_API_KEY');

  if (!stripeKey || !eupagoKey) {
    throw new Error('Missing required environment variables');
  }

  return {
    stripeKey,
    eupagoKey,
  };
};