import { emailStyles } from './templates/styles.ts';
import { createOrderDetailsSection } from './templates/orderDetails.ts';
import { createShippingSection } from './templates/shippingDetails.ts';
import { createProductsSection } from './templates/productsSection.ts';
import { createPaymentSection } from './templates/paymentDetails.ts';

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

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${type === 'created' ? 'Nova Encomenda' : 'Pagamento Confirmado'}</title>
    <style>
      ${emailStyles}
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
};