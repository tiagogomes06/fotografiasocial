import { OrderDetails } from "./types.ts";

export const createEmailTemplate = (
  order: OrderDetails, 
  type: 'created' | 'paid', 
  isAdmin = false,
  paymentDetails?: { entity: string; reference: string; amount: number }
) => {
  const title = type === 'created' ? 
    'Nova Encomenda Criada' : 
    'Pagamento Recebido';

  const message = type === 'created' ? 
    'A sua encomenda foi criada com sucesso.' : 
    isAdmin ? 'Foi recebido um novo pagamento.' : 'O pagamento da sua encomenda foi confirmado.';

  const shippingInfo = order.shipping_address ? 
    `<div style="margin-bottom: 1rem; padding: 1rem; background-color: #f9fafb; border-radius: 0.5rem;">
      <p style="font-weight: 600; margin-bottom: 0.5rem;">Morada de Envio:</p>
      <p style="margin: 0.25rem 0;">${order.shipping_name}</p>
      <p style="margin: 0.25rem 0;">${order.shipping_address}</p>
      <p style="margin: 0.25rem 0;">${order.shipping_postal_code} ${order.shipping_city}</p>
    </div>` : '';

  const subtotal = order.total_amount - (order.shipping_methods?.price || 0);

  const multibancoPaymentInfo = paymentDetails && order.payment_method === 'multibanco' ? 
    `<div style="margin: 1.5rem 0; padding: 1.5rem; background-color: #f0f9ff; border-radius: 0.5rem; border: 1px solid #bae6fd;">
      <h2 style="color: #0369a1; font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Dados para Pagamento Multibanco</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
        <div>
          <p style="color: #64748b; font-size: 0.875rem;">Entidade</p>
          <p style="color: #0f172a; font-size: 1.25rem; font-weight: 600;">${paymentDetails.entity}</p>
        </div>
        <div>
          <p style="color: #64748b; font-size: 0.875rem;">Referência</p>
          <p style="color: #0f172a; font-size: 1.25rem; font-weight: 600;">${paymentDetails.reference}</p>
        </div>
        <div>
          <p style="color: #64748b; font-size: 0.875rem;">Montante</p>
          <p style="color: #0f172a; font-size: 1.25rem; font-weight: 600;">${paymentDetails.amount}€</p>
        </div>
      </div>
      <div style="background-color: #fff7ed; border-radius: 0.375rem; padding: 1rem; margin-top: 1rem;">
        <p style="color: #9a3412; font-size: 0.875rem; display: flex; align-items: center;">
          ⚠️ Por favor efetue o pagamento nas próximas 24 horas. Após este período, a referência poderá expirar.
        </p>
      </div>
    </div>` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 1.25rem;">
  <div style="background-color: white; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
    <h1 style="color: #111827; margin-bottom: 1rem; text-align: center; font-size: 1.5rem; font-weight: 600;">${title}</h1>
    <p style="text-align: center; color: #4b5563; margin-bottom: 1.5rem;">${message}</p>
  </div>

  ${multibancoPaymentInfo}

  <div style="background-color: white; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
    <div style="margin-bottom: 1rem;">
      <p style="margin: 0.5rem 0;"><strong style="color: #374151;">Número da Encomenda:</strong> ${order.id}</p>
      <p style="margin: 0.5rem 0;"><strong style="color: #374151;">Cliente:</strong> ${order.shipping_name}</p>
      <p style="margin: 0.5rem 0;"><strong style="color: #374151;">Email:</strong> ${order.email}</p>
      <p style="margin: 0.5rem 0;"><strong style="color: #374151;">Telefone:</strong> ${order.shipping_phone}</p>
    </div>

    ${shippingInfo}

    <div style="margin-bottom: 1rem;">
      <p style="margin: 0.5rem 0;"><strong style="color: #374151;">Método de Pagamento:</strong> ${order.payment_method}</p>
      <p style="margin: 0.5rem 0;"><strong style="color: #374151;">Método de Envio:</strong> ${order.shipping_methods?.name} ${order.shipping_methods?.price ? `(${order.shipping_methods.price}€)` : '(Grátis)'}</p>
    </div>
  </div>

  <div style="background-color: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
    <h2 style="color: #111827; margin-bottom: 1rem; font-size: 1.25rem; font-weight: 600;">Itens da Encomenda</h2>
    
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      ${order.order_items.map(item => `
        <div style="padding: 1rem; background-color: #f9fafb; border-radius: 0.5rem;">
          <p style="margin: 0.25rem 0; font-weight: 600; color: #374151;">${item.products.name}</p>
          <p style="margin: 0.25rem 0; color: #4b5563;">Quantidade: ${item.quantity}</p>
          <p style="margin: 0.25rem 0; color: #4b5563;">Preço: ${item.price_at_time}€</p>
          <a href="${item.photos.url}" style="color: #4f46e5; text-decoration: none; display: inline-block; margin-top: 0.5rem; font-weight: 500;">Ver Foto</a>
        </div>
      `).join('')}
    </div>

    <div style="margin-top: 1.5rem; border-top: 1px solid #e5e7eb; padding-top: 1rem;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="color: #4b5563;">Subtotal:</span>
        <span style="font-weight: 500;">${subtotal}€</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="color: #4b5563;">Portes de Envio:</span>
        <span style="font-weight: 500;">${order.shipping_methods?.price || 0}€</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #e5e7eb;">
        <span style="font-weight: 600; color: #111827;">Total:</span>
        <span style="font-weight: 600; color: #111827;">${order.total_amount}€</span>
      </div>
    </div>
  </div>

  <div style="text-align: center; margin-top: 1.5rem;">
    <p style="color: #6b7280;">Obrigado pela sua preferência!</p>
  </div>
</body>
</html>`;
};