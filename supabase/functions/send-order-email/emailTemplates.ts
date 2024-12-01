export const createEmailTemplate = (order: any, type: 'created' | 'paid', isAdmin: boolean, paymentDetails?: any) => {
  const orderItems = order.order_items?.map((item: any) => ({
    quantity: item.quantity || 1,
    price: item.price_at_time || 0,
    name: item.products?.name || 'Fotografia',
    photoUrl: item.photos?.url || '',
  })) || [];

  const shippingMethod = order.shipping_methods || { name: '', price: 0 };
  const orderDate = new Date(order.created_at).toLocaleDateString('pt-PT');
  const totalAmount = Number(order.total_amount || 0).toFixed(2);

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${type === 'created' ? 'Confirmação de Encomenda' : 'Pagamento Confirmado'}</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333333; margin: 0; font-size: 24px; font-weight: bold;">
                ${type === 'created' ? 'Confirmação de Encomenda' : 'Pagamento Confirmado'}
            </h1>
        </div>

        <div style="color: #666666; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
            ${type === 'created' 
              ? 'Obrigado pela sua encomenda! Aqui estão os detalhes da sua compra:'
              : 'O seu pagamento foi confirmado com sucesso! Aqui estão os detalhes da sua compra:'}
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">Detalhes da Encomenda</h2>
            <p style="margin: 5px 0; color: #666666;">Número da Encomenda: ${order.id}</p>
            <p style="margin: 5px 0; color: #666666;">Data: ${orderDate}</p>
            <p style="margin: 5px 0; color: #666666;">Total: ${totalAmount}€</p>
        </div>

        ${order.shipping_method_id ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">Detalhes de Envio</h2>
                <p style="margin: 5px 0; color: #666666;">Método: ${shippingMethod.name}</p>
                <p style="margin: 5px 0; color: #666666;">Nome: ${order.shipping_name || ''}</p>
                <p style="margin: 5px 0; color: #666666;">Morada: ${order.shipping_address || ''}</p>
                <p style="margin: 5px 0; color: #666666;">Código Postal: ${order.shipping_postal_code || ''}</p>
                <p style="margin: 5px 0; color: #666666;">Cidade: ${order.shipping_city || ''}</p>
                <p style="margin: 5px 0; color: #666666;">Telefone: ${order.shipping_phone || ''}</p>
            </div>
        ` : ''}

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">Produtos</h2>
            ${orderItems.map((item: any) => `
                <div style="border-bottom: 1px solid #eee; padding: 15px 0; ${orderItems.indexOf(item) === 0 ? 'padding-top: 0;' : ''}">
                    <h3 style="margin: 0 0 10px 0; color: #333333; font-size: 16px;">${item.name}</h3>
                    <p style="margin: 5px 0; color: #666666;">Quantidade: ${item.quantity}</p>
                    <p style="margin: 5px 0; color: #666666;">Preço: ${Number(item.price).toFixed(2)}€</p>
                    ${isAdmin && item.photoUrl ? `
                        <p style="margin: 10px 0;">
                            <a href="${item.photoUrl}" 
                               style="display: inline-block; padding: 8px 16px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
                                Ver Foto
                            </a>
                        </p>
                    ` : ''}
                </div>
            `).join('')}
        </div>

        ${type === 'created' && paymentDetails ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px;">
                <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">Dados para Pagamento</h2>
                <p style="margin: 5px 0; color: #666666;">Entidade: ${paymentDetails.entity}</p>
                <p style="margin: 5px 0; color: #666666;">Referência: ${paymentDetails.reference}</p>
                <p style="margin: 5px 0; color: #666666;">Montante: ${Number(paymentDetails.amount).toFixed(2)}€</p>
            </div>
        ` : ''}

        <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #666666;">
                ${type === 'created' 
                  ? 'Assim que recebermos a confirmação do seu pagamento, iremos processar a sua encomenda.'
                  : 'A sua encomenda será processada em breve.'}
            </p>
        </div>
    </div>
</body>
</html>`.trim();
};