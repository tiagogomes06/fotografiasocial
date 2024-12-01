export const createEmailTemplate = (order: any, type: 'created' | 'paid', isAdmin: boolean, paymentDetails?: any) => {
  // Ensure order items exist and have all required properties
  const orderItems = order.order_items?.map((item: any) => ({
    quantity: item.quantity || 1,
    price_at_time: item.price_at_time || 0,
    products: {
      name: item.products?.name || 'Produto',
    },
    photos: {
      url: item.photos?.url || '',
    },
  })) || [];

  const shippingMethod = order.shipping_methods || { name: '', price: 0 };
  
  const orderDate = new Date(order.created_at).toLocaleDateString('pt-PT');
  const totalAmount = Number(order.total_amount || 0).toFixed(2);

  return `
    <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
      <h1 style="color: #111827; font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem;">
        ${type === 'created' ? 'Confirmação de Encomenda' : 'Pagamento Confirmado'}
      </h1>

      ${type === 'created' ? `
        <p style="margin-bottom: 1rem; color: #4b5563;">
          Obrigado pela sua encomenda! Aqui estão os detalhes da sua compra:
        </p>
      ` : `
        <p style="margin-bottom: 1rem; color: #4b5563;">
          O seu pagamento foi confirmado com sucesso! Aqui estão os detalhes da sua compra:
        </p>
      `}

      <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
        <h2 style="color: #111827; font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Detalhes da Encomenda</h2>
        <p style="margin: 0.25rem 0; color: #4b5563;">Número da Encomenda: ${order.id}</p>
        <p style="margin: 0.25rem 0; color: #4b5563;">Data: ${orderDate}</p>
        <p style="margin: 0.25rem 0; color: #4b5563;">Total: ${totalAmount}€</p>
      </div>

      ${order.shipping_method_id ? `
        <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
          <h2 style="color: #111827; font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Detalhes de Envio</h2>
          <p style="margin: 0.25rem 0; color: #4b5563;">Método: ${shippingMethod.name}</p>
          <p style="margin: 0.25rem 0; color: #4b5563;">Nome: ${order.shipping_name || ''}</p>
          <p style="margin: 0.25rem 0; color: #4b5563;">Morada: ${order.shipping_address || ''}</p>
          <p style="margin: 0.25rem 0; color: #4b5563;">Código Postal: ${order.shipping_postal_code || ''}</p>
          <p style="margin: 0.25rem 0; color: #4b5563;">Cidade: ${order.shipping_city || ''}</p>
          <p style="margin: 0.25rem 0; color: #4b5563;">Telefone: ${order.shipping_phone || ''}</p>
        </div>
      ` : ''}

      <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem;">
        <h2 style="color: #111827; font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Produtos</h2>
        ${orderItems.map((item: any) => `
        <div style="border-bottom: 1px solid #e5e7eb; padding: 1rem 0;">
          <p style="margin: 0.25rem 0; font-weight: 600; color: #374151;">${item.products.name}</p>
          <p style="margin: 0.25rem 0; color: #4b5563;">Quantidade: ${item.quantity}</p>
          <p style="margin: 0.25rem 0; color: #4b5563;">Preço: ${Number(item.price_at_time).toFixed(2)}€</p>
          ${isAdmin && item.photos?.url ? `<a href="${item.photos.url}" style="color: #4f46e5; text-decoration: none; display: inline-block; margin-top: 0.5rem; font-weight: 500;">Ver Foto</a>` : ''}
        </div>
      `).join('')}
    </div>

    ${type === 'created' ? `
      <div style="margin-top: 2rem; padding: 1rem; background-color: #f3f4f6; border-radius: 0.5rem;">
        <p style="margin: 0; color: #4b5563;">
          Assim que recebermos a confirmação do seu pagamento, iremos processar a sua encomenda.
        </p>
      </div>
    ` : `
      <div style="margin-top: 2rem; padding: 1rem; background-color: #f3f4f6; border-radius: 0.5rem;">
        <p style="margin: 0; color: #4b5563;">
          A sua encomenda será processada em breve.
        </p>
      </div>
    `}
  </div>
  `;
};