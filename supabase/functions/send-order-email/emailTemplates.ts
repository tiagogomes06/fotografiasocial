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

  const getPaymentInstructions = () => {
    if (type === 'created') {
      if (order.payment_method === 'multibanco' && paymentDetails) {
        return `
          <div class="section">
            <h2>Dados para Pagamento Multibanco</h2>
            <div class="info-row">Entidade: ${paymentDetails.entity}</div>
            <div class="info-row">Referência: ${paymentDetails.reference}</div>
            <div class="info-row">Montante: ${Number(paymentDetails.amount).toFixed(2)}€</div>
          </div>
        `;
      }
      return '';
    }
    return '';
  };

  const getStatusMessage = () => {
    if (type === 'created') {
      return 'A sua encomenda foi recebida com sucesso! Por favor, proceda ao pagamento para que possamos processar o seu pedido.';
    }
    return 'O seu pagamento foi confirmado com sucesso! A sua encomenda será processada em breve.';
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${type === 'created' ? 'Nova Encomenda' : 'Pagamento Confirmado'}</title>
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
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
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
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 10px;
        }
        .info-row {
            margin: 10px 0;
            color: #666666;
            display: flex;
            justify-content: space-between;
        }
        .info-row strong {
            color: #333333;
        }
        .product-item {
            border-bottom: 1px solid #eee;
            padding: 15px 0;
        }
        .product-item:last-child {
            border-bottom: none;
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
            color: white !important;
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
            color: #666666;
        }
        .status-message {
            background-color: #e8f4fe;
            color: #0066cc;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${type === 'created' ? 'Nova Encomenda' : 'Pagamento Confirmado'}</h1>
        </div>

        <div class="status-message">
            ${getStatusMessage()}
        </div>

        <div class="section">
            <h2>Detalhes da Encomenda</h2>
            <div class="info-row">
                <span>Número da Encomenda:</span>
                <strong>${order.id}</strong>
            </div>
            <div class="info-row">
                <span>Data:</span>
                <strong>${orderDate}</strong>
            </div>
            <div class="info-row">
                <span>Total:</span>
                <strong>${totalAmount}€</strong>
            </div>
        </div>

        ${order.shipping_method_id ? `
            <div class="section">
                <h2>Detalhes de Envio</h2>
                <div class="info-row">
                    <span>Método:</span>
                    <strong>${shippingMethod.name}</strong>
                </div>
                <div class="info-row">
                    <span>Nome:</span>
                    <strong>${order.shipping_name || ''}</strong>
                </div>
                ${order.shipping_address ? `
                    <div class="info-row">
                        <span>Morada:</span>
                        <strong>${order.shipping_address}</strong>
                    </div>
                ` : ''}
                ${order.shipping_postal_code ? `
                    <div class="info-row">
                        <span>Código Postal:</span>
                        <strong>${order.shipping_postal_code}</strong>
                    </div>
                ` : ''}
                ${order.shipping_city ? `
                    <div class="info-row">
                        <span>Cidade:</span>
                        <strong>${order.shipping_city}</strong>
                    </div>
                ` : ''}
                <div class="info-row">
                    <span>Telefone:</span>
                    <strong>${order.shipping_phone || ''}</strong>
                </div>
            </div>
        ` : ''}

        <div class="section">
            <h2>Produtos</h2>
            ${orderItems.map((item: any) => `
                <div class="product-item">
                    <h3>${item.name}</h3>
                    <div class="info-row">
                        <span>Quantidade:</span>
                        <strong>${item.quantity}</strong>
                    </div>
                    <div class="info-row">
                        <span>Preço:</span>
                        <strong>${Number(item.price).toFixed(2)}€</strong>
                    </div>
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

        ${getPaymentInstructions()}

        <div class="footer">
            ${type === 'created' 
              ? 'Assim que recebermos a confirmação do seu pagamento, iremos processar a sua encomenda.'
              : 'A sua encomenda será processada em breve.'}
        </div>
    </div>
</body>
</html>`.trim();
};