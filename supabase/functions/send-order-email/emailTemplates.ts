import { OrderDetails } from './types';

export const createEmailTemplate = (order: OrderDetails, type: 'created' | 'paid', isAdmin = false) => {
  const title = type === 'created' ? 
    'Nova Encomenda Criada' : 
    'Pagamento Recebido';

  const message = type === 'created' ? 
    'A sua encomenda foi criada com sucesso.' : 
    isAdmin ? 'Foi recebido um novo pagamento.' : 'O pagamento da sua encomenda foi confirmado.';

  const shippingInfo = order.shipping_address ? 
    `<div style="margin-bottom: 16px; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
      <p style="font-weight: 600; margin-bottom: 8px;">Morada de Envio:</p>
      <p style="margin: 4px 0;">${order.shipping_name}</p>
      <p style="margin: 4px 0;">${order.shipping_address}</p>
      <p style="margin: 4px 0;">${order.shipping_postal_code} ${order.shipping_city}</p>
    </div>` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #111827; margin-bottom: 16px; text-align: center; font-size: 24px; font-weight: 600;">${title}</h1>
        <p style="text-align: center; color: #4b5563; margin-bottom: 24px;">${message}</p>
      </div>

      <div style="background-color: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
        <div style="margin-bottom: 16px;">
          <p style="margin: 8px 0;"><span style="font-weight: 600; color: #374151;">Número da Encomenda:</span> ${order.id}</p>
          <p style="margin: 8px 0;"><span style="font-weight: 600; color: #374151;">Cliente:</span> ${order.shipping_name}</p>
          <p style="margin: 8px 0;"><span style="font-weight: 600; color: #374151;">Email:</span> ${order.email}</p>
          <p style="margin: 8px 0;"><span style="font-weight: 600; color: #374151;">Telefone:</span> ${order.shipping_phone}</p>
        </div>

        ${shippingInfo}

        <div style="margin-bottom: 16px;">
          <p style="margin: 8px 0;"><span style="font-weight: 600; color: #374151;">Método de Pagamento:</span> ${order.payment_method}</p>
          <p style="margin: 8px 0;"><span style="font-weight: 600; color: #374151;">Método de Envio:</span> ${order.shipping_methods?.name} 
            ${order.shipping_methods?.price ? `(${order.shipping_methods.price}€)` : '(Grátis)'}</p>
        </div>
      </div>

      <div style="background-color: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #111827; margin-bottom: 16px; font-size: 20px; font-weight: 600;">Itens da Encomenda</h2>
        
        ${order.order_items.map(item => `
          <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
            <div style="margin-bottom: 8px;">
              <p style="margin: 4px 0; font-weight: 600; color: #374151;">${item.products.name}</p>
              <p style="margin: 4px 0; color: #6b7280;">Quantidade: ${item.quantity}</p>
              <p style="margin: 4px 0; color: #6b7280;">Preço: ${item.price_at_time}€</p>
              <a href="${item.photos.url.replace(/([^.]+)([^.]+)$/, '$1.$2')}" 
                 style="color: #4f46e5; text-decoration: none; display: inline-block; margin-top: 8px; font-weight: 500;">
                Ver Foto
              </a>
            </div>
          </div>
        `).join('')}

        <div style="margin-top: 16px; text-align: right;">
          <p style="margin: 0; font-weight: 600; color: #111827;">
            Total: ${order.total_amount}€
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <p style="color: #6b7280;">Obrigado pela sua preferência!</p>
      </div>
    </body>
    </html>
  `;
};