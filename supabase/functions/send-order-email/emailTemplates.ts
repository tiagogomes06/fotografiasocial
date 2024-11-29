interface OrderDetails {
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

const createEmailTemplate = (order: OrderDetails, type: 'created' | 'paid', isAdmin = false) => {
  const title = type === 'created' ? 
    'Nova Encomenda Criada' : 
    'Pagamento Recebido';

  const message = type === 'created' ? 
    'A sua encomenda foi criada com sucesso.' : 
    isAdmin ? 'Foi recebido um novo pagamento.' : 'O pagamento da sua encomenda foi confirmado.';

  const shippingInfo = order.shipping_address ? 
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <div style="font-family: sans-serif;">
          <strong class="text-gray-700">Morada de Envio:</strong><br>
          ${order.shipping_name}<br>
          ${order.shipping_address}<br>
          ${order.shipping_postal_code} ${order.shipping_city}
        </div>
      </td>
    </tr>` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
      </style>
    </head>
    <body style="font-family: 'Inter', sans-serif; line-height: 1.5; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: white; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #111827; margin-bottom: 16px; text-align: center; font-size: 24px; font-weight: 600;">${title}</h1>
        <p style="text-align: center; color: #6B7280; margin-bottom: 24px;">${message}</p>
      </div>

      <div style="background-color: white; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <div style="font-family: sans-serif;">
                <strong class="text-gray-700">Número da Encomenda:</strong> ${order.id}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <div style="font-family: sans-serif;">
                <strong class="text-gray-700">Cliente:</strong> ${order.shipping_name}<br>
                <strong class="text-gray-700">Email:</strong> ${order.email}<br>
                <strong class="text-gray-700">Telefone:</strong> ${order.shipping_phone}
              </div>
            </td>
          </tr>
          ${shippingInfo}
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <div style="font-family: sans-serif;">
                <strong class="text-gray-700">Método de Pagamento:</strong> ${order.payment_method}<br>
                <strong class="text-gray-700">Método de Envio:</strong> ${order.shipping_methods?.name || 'N/A'} 
                (${order.shipping_methods?.price ? order.shipping_methods.price + '€' : 'Grátis'})
              </div>
            </td>
          </tr>
        </table>
      </div>

      <div style="background-color: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #111827; margin-bottom: 16px; font-size: 18px; font-weight: 600;">Itens da Encomenda</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${order.order_items.map(item => `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <div style="display: flex; align-items: center;">
                  <div style="flex: 1; font-family: sans-serif;">
                    <strong class="text-gray-700">${item.products.name}</strong><br>
                    <span class="text-gray-600">Quantidade: ${item.quantity}</span><br>
                    <span class="text-gray-600">Preço: ${item.price_at_time}€</span><br>
                    <a href="${item.photos.url}" 
                       style="color: #6366f1; text-decoration: none; display: inline-block; margin-top: 8px; font-weight: 500;">
                      Ver Foto
                    </a>
                  </div>
                </div>
              </td>
            </tr>
          `).join('')}
          <tr>
            <td style="padding: 12px; text-align: right;">
              <div style="font-family: sans-serif;">
                <strong class="text-gray-700">Total:</strong> 
                <span style="color: #111827; font-weight: 600;">${order.total_amount}€</span>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <p style="color: #6B7280; font-size: 14px;">Obrigado pela sua preferência!</p>
      </div>
    </body>
    </html>
  `;
};

export { createEmailTemplate };
export type { OrderDetails };