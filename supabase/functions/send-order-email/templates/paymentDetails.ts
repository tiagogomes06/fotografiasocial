export const createPaymentSection = (order: any, paymentDetails?: any) => {
  if (order.payment_method !== 'multibanco' || !paymentDetails) return '';

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 1);
  const formattedExpiryDate = expiryDate.toLocaleDateString('pt-PT');

  return `
    <div class="section payment-details">
      <h2>Dados para Pagamento Multibanco</h2>
      <div class="info-row">
        <span>Entidade:</span>
        <strong>${paymentDetails.entity}</strong>
      </div>
      <div class="info-row">
        <span>Referência:</span>
        <strong>${paymentDetails.reference}</strong>
      </div>
      <div class="info-row">
        <span>Montante:</span>
        <strong>${Number(paymentDetails.amount).toFixed(2)}€</strong>
      </div>
      <div class="info-row">
        <span>Data Limite:</span>
        <strong>${formattedExpiryDate}</strong>
      </div>
      <div class="payment-warning">
        <p>⚠️ Por favor efetue o pagamento até à data limite indicada. Após este período, a referência será cancelada.</p>
      </div>
    </div>
  `;
};