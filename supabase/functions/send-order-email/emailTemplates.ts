import { createOrderDetailsSection } from './templates/orderDetails.ts';
import { createShippingSection } from './templates/shippingDetails.ts';
import { createProductsSection } from './templates/productsSection.ts';
import { createPaymentSection } from './templates/paymentDetails.ts';

const removeArtifacts = (str: string) => {
  return str.replace(/=20/g, '').trim();
};

export const createEmailTemplate = (order: any, type: 'created' | 'paid', isAdmin: boolean, paymentDetails?: any) => {
  const getStatusMessage = () => {
    if (type === 'created') {
      if (order.payment_method === 'multibanco') {
        return 'A sua encomenda foi recebida com sucesso! Por favor, efetue o pagamento através dos dados Multibanco fornecidos abaixo.';
      }
      return 'A sua encomenda foi recebida com sucesso! Por favor, proceda ao pagamento para que possamos processar o seu pedido.';
    }
    return 'O seu pagamento foi confirmado com sucesso! A sua encomenda será processada em breve.';
  };

  const template = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
        align-items: center;
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
      .payment-details {
        background-color: #fff3cd;
        border: 1px solid #ffeeba;
      }
      .payment-warning {
        margin-top: 15px;
        padding: 10px;
        background-color: #fff3cd;
        border-radius: 4px;
        text-align: center;
        color: #856404;
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
      .photo-link-container {
        margin-top: 10px;
        text-align: center;
      }
      .photo-link {
        display: inline-block;
        padding: 8px 16px;
        background-color: #8B5CF6;
        color: white !important;
        text-decoration: none;
        border-radius: 4px;
        font-size: 14px;
      }
      .photo-link:hover {
        background-color: #7C3AED;
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

        ${createOrderDetailsSection(order)}
        
        ${type === 'created' && order.payment_method === 'multibanco' ? createPaymentSection(order, paymentDetails) : ''}
        
        ${createShippingSection(order)}
        
        ${createProductsSection(order, isAdmin)}

        <div class="footer">
            ${type === 'created' 
              ? 'Assim que recebermos a confirmação do seu pagamento, iremos processar a sua encomenda.'
              : 'A sua encomenda será processada em breve.'}
        </div>
    </div>
</body>
</html>`.trim();

  return removeArtifacts(template);
};