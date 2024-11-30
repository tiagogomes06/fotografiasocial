import { OrderDetails } from "./types.ts";

export const createEmailTemplate = (order: OrderDetails, type: 'created' | 'paid', isAdmin = false) => {
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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 1.25rem; background-color: #f3f4f6;">
      <div style="background-color: white; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
        <h1 style="color: #111827; margin-bottom: 1rem; text-align: center; font-size: 1.5rem; font-weight: 600;">${title}</h1>
        <p style="text-align: center; color: #4b5563; margin-bottom: 1.5rem;">${message}</p>
      </div>

      <div style="background-color: white; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
        <div style="margin-bottom: 1rem;">
          <p style="margin: 0.5rem 0;"><span style="font-weight: 600; color: #374151;">Número da Encomenda:</span> ${order.id}</p>
          <p style="margin: 0.5rem 0;"><span style="font-weight: 600; color: #374151;">Cliente:</span> ${order.shipping_name}</p>
          <p style="margin: 0.5rem 0;"><span style="font-weight: 600; color: #374151;">Email:</span> ${order.email}</p>
          <p style="margin: 0.5rem 0;"><span style="font-weight: 600; color: #374151;">Telefone:</span> ${order.shipping_phone}</p>
        </div>

        ${shippingInfo}

        <div style="margin-bottom: 1rem;">
          <p style="margin: 0.5rem 0;"><span style="font-weight: 600; color: #374151;">Método de Pagamento:</span> ${order.payment_method}</p>
          <p style="margin: 0.5rem 0;"><span style="font-weight: 600; color: #374151;">Método de Envio:</span> ${order.shipping_methods?.name} 
            ${order.shipping_methods?.price ? `(${order.shipping_methods.price}€)` : '(Grátis)'}</p>
        </div>
      </div>

      <div style="background-color: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #111827; margin-bottom: 1rem; font-size: 1.25rem; font-weight: 600;">Itens da Encomenda</h2>
        
        ${order.order_items.map(item => `
          <div style="padding: 1rem 0; border-bottom: 1px solid #f3f4f6;">
            <div style="margin-bottom: 0.5rem;">
              <p style="margin: 0.25rem 0; font-weight: 600; color: #374151;">${item.products.name}</p>
              <p style="margin: 0.25rem 0; color: #4b5563;">Quantidade: ${item.quantity}</p>
              <p style="margin: 0.25rem 0; color: #4b5563;">Preço: ${item.price_at_time}€</p>
              <a href="${item.photos.url}" 
                 style="color: #4f46e5; text-decoration: none; display: inline-block; margin-top: 0.5rem; font-weight: 500;">
                Ver Foto
              </a>
            </div>
          </div>
        `).join('')}

        <div style="margin-top: 1rem; text-align: right;">
          <p style="font-weight: 600; color: #111827;">
            Total: ${order.total_amount}€
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 1.5rem;">
        <p style="color: #6b7280;">Obrigado pela sua preferência!</p>
      </div>
    </body>
    </html>
  `;
};