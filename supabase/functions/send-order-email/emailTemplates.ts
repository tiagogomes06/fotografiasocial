import { OrderDetails } from "./types.ts";

export const createEmailTemplate = (order: OrderDetails, type: 'created' | 'paid', isAdmin = false) => {
  const title = type === 'created' ? 
    'Nova Encomenda Criada' : 
    'Pagamento Recebido';

  const message = type === 'created' ? 
    'A sua encomenda foi criada com sucesso.' : 
    isAdmin ? 'Foi recebido um novo pagamento.' : 'O pagamento da sua encomenda foi confirmado.';

  const shippingInfo = order.shipping_address ? 
    `<div class="mb-4 p-4 bg-gray-50 rounded-lg">
      <p class="font-semibold mb-2">Morada de Envio:</p>
      <p class="my-1">${order.shipping_name}</p>
      <p class="my-1">${order.shipping_address}</p>
      <p class="my-1">${order.shipping_postal_code} ${order.shipping_city}</p>
    </div>` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="font-sans leading-relaxed text-gray-800 max-w-2xl mx-auto p-5 bg-gray-50">
      <div class="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <h1 class="text-gray-900 mb-4 text-center text-2xl font-semibold">${title}</h1>
        <p class="text-center text-gray-600 mb-6">${message}</p>
      </div>

      <div class="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div class="mb-4">
          <p class="my-2"><span class="font-semibold text-gray-700">Número da Encomenda:</span> ${order.id}</p>
          <p class="my-2"><span class="font-semibold text-gray-700">Cliente:</span> ${order.shipping_name}</p>
          <p class="my-2"><span class="font-semibold text-gray-700">Email:</span> ${order.email}</p>
          <p class="my-2"><span class="font-semibold text-gray-700">Telefone:</span> ${order.shipping_phone}</p>
        </div>

        ${shippingInfo}

        <div class="mb-4">
          <p class="my-2"><span class="font-semibold text-gray-700">Método de Pagamento:</span> ${order.payment_method}</p>
          <p class="my-2"><span class="font-semibold text-gray-700">Método de Envio:</span> ${order.shipping_methods?.name} 
            ${order.shipping_methods?.price ? `(${order.shipping_methods.price}€)` : '(Grátis)'}</p>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-gray-900 mb-4 text-xl font-semibold">Itens da Encomenda</h2>
        
        ${order.order_items.map(item => `
          <div class="py-4 border-b border-gray-100">
            <div class="mb-2">
              <p class="my-1 font-semibold text-gray-700">${item.products.name}</p>
              <p class="my-1 text-gray-600">Quantidade: ${item.quantity}</p>
              <p class="my-1 text-gray-600">Preço: ${item.price_at_time}€</p>
              <a href="${item.photos.url}" 
                 class="text-indigo-600 no-underline inline-block mt-2 font-medium hover:text-indigo-700">
                Ver Foto
              </a>
            </div>
          </div>
        `).join('')}

        <div class="mt-4 text-right">
          <p class="font-semibold text-gray-900">
            Total: ${order.total_amount}€
          </p>
        </div>
      </div>

      <div class="text-center mt-6">
        <p class="text-gray-500">Obrigado pela sua preferência!</p>
      </div>
    </body>
    </html>
  `;
};