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
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #333333;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        .section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .section h2 {
            color: #333333;
            margin: 0 0 15px 0;
            font-size: 18px;
        }
        .info-row {
            margin: 5px 0;
            color: #666666;
        }
        .product-item {
            border-bottom: 1px solid #eee;
            padding: 15px 0;
        }
        .product-item:first-child {
            padding-top: 0;
        }
        .product-item h3 {
            margin: 0 0 10px 0;
            color: #333333;
            font-size: 16px;
        }
        .photo-link {
            display: inline-block;
            padding: 8px 16px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 10px;
        }
        .footer {
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${type === 'created' ? 'Confirmação de Encomenda' : 'Pagamento Confirmado'}</h1>
        </div>

        <div style="color: #666666; font-size: 16px; margin-bottom: 30px;">
            ${type === 'created' 
              ? 'Obrigado pela sua encomenda! Aqui estão os detalhes da sua compra:'
              : 'O seu pagamento foi confirmado com sucesso! Aqui estão os detalhes da sua compra:'}
        </div>

        <div class="section">
            <h2>Detalhes da Encomenda</h2>
            <div class="info-row">Número da Encomenda: ${order.id}</div>
            <div class="info-row">Data: ${orderDate}</div>
            <div class="info-row">Total: ${totalAmount}€</div>
        </div>

        ${order.shipping_method_id ? `
            <div class="section">
                <h2>Detalhes de Envio</h2>
                <div class="info-row">Método: ${shippingMethod.name}</div>
                <div class="info-row">Nome: ${order.shipping_name || ''}</div>
                <div class="info-row">Morada: ${order.shipping_address || ''}</div>
                <div class="info-row">Código Postal: ${order.shipping_postal_code || ''}</div>
                <div class="info-row">Cidade: ${order.shipping_city || ''}</div>
                <div class="info-row">Telefone: ${order.shipping_phone || ''}</div>
            </div>
        ` : ''}

        <div class="section">
            <h2>Produtos</h2>
            ${orderItems.map((item: any) => `
                <div class="product-item">
                    <h3>${item.name}</h3>
                    <div class="info-row">Quantidade: ${item.quantity}</div>
                    <div class="info-row">Preço: ${Number(item.price).toFixed(2)}€</div>
                    ${isAdmin && item.photoUrl ? `
                        <div style="margin-top: 10px;">
                            <a href="${item.photoUrl}" class="photo-link">
                                Ver Foto
                            </a>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>

        ${type === 'created' && paymentDetails ? `
            <div class="section">
                <h2>Dados para Pagamento</h2>
                <div class="info-row">Entidade: ${paymentDetails.entity}</div>
                <div class="info-row">Referência: ${paymentDetails.reference}</div>
                <div class="info-row">Montante: ${Number(paymentDetails.amount).toFixed(2)}€</div>
            </div>
        ` : ''}

        <div class="footer">
            <div style="color: #666666;">
                ${type === 'created' 
                  ? 'Assim que recebermos a confirmação do seu pagamento, iremos processar a sua encomenda.'
                  : 'A sua encomenda será processada em breve.'}
            </div>
        </div>
    </div>
</body>
</html>`.trim();
};