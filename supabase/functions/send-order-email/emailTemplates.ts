export const createEmailTemplate = (order: any, type: 'created' | 'paid', isAdmin: boolean, paymentDetails?: any) => {
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

  // Create a clean HTML template without any special characters or encoding issues
  const template = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${type === 'created' ? 'Confirmação de Encomenda' : 'Pagamento Confirmado'}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #333; margin-bottom: 20px;">
      ${type === 'created' ? 'Confirmação de Encomenda' : 'Pagamento Confirmado'}
    </h1>

    ${type === 'created' 
      ? '<p>Obrigado pela sua encomenda! Aqui estão os detalhes da sua compra:</p>'
      : '<p>O seu pagamento foi confirmado com sucesso! Aqui estão os detalhes da sua compra:</p>'
    }

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h2 style="color: #333; margin-bottom: 15px;">Detalhes da Encomenda</h2>
      <p style="margin: 5px 0;">Número da Encomenda: ${order.id}</p>
      <p style="margin: 5px 0;">Data: ${orderDate}</p>
      <p style="margin: 5px 0;">Total: ${totalAmount}€</p>
    </div>

    ${order.shipping_method_id ? `
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #333; margin-bottom: 15px;">Detalhes de Envio</h2>
        <p style="margin: 5px 0;">Método: ${shippingMethod.name}</p>
        <p style="margin: 5px 0;">Nome: ${order.shipping_name || ''}</p>
        <p style="margin: 5px 0;">Morada: ${order.shipping_address || ''}</p>
        <p style="margin: 5px 0;">Código Postal: ${order.shipping_postal_code || ''}</p>
        <p style="margin: 5px 0;">Cidade: ${order.shipping_city || ''}</p>
        <p style="margin: 5px 0;">Telefone: ${order.shipping_phone || ''}</p>
      </div>
    ` : ''}

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
      <h2 style="color: #333; margin-bottom: 15px;">Produtos</h2>
      ${orderItems.map((item: any) => `
        <div style="border-bottom: 1px solid #dee2e6; padding: 10px 0;">
          <p style="margin: 5px 0; font-weight: bold;">${item.products.name}</p>
          <p style="margin: 5px 0;">Quantidade: ${item.quantity}</p>
          <p style="margin: 5px 0;">Preço: ${Number(item.price_at_time).toFixed(2)}€</p>
          ${isAdmin && item.photos?.url ? `
            <p style="margin: 5px 0;">
              <a href="${item.photos.url}" style="color: #0066cc; text-decoration: none;">Ver Foto</a>
            </p>
          ` : ''}
        </div>
      `).join('')}
    </div>

    ${type === 'created' && paymentDetails ? `
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <h2 style="color: #333; margin-bottom: 15px;">Dados para Pagamento</h2>
        <p style="margin: 5px 0;">Entidade: ${paymentDetails.entity}</p>
        <p style="margin: 5px 0;">Referência: ${paymentDetails.reference}</p>
        <p style="margin: 5px 0;">Montante: ${Number(paymentDetails.amount).toFixed(2)}€</p>
      </div>
    ` : ''}

    <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
      <p style="margin: 0;">
        ${type === 'created' 
          ? 'Assim que recebermos a confirmação do seu pagamento, iremos processar a sua encomenda.'
          : 'A sua encomenda será processada em breve.'}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return template;
};