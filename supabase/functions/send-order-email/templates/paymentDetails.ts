export const createPaymentSection = (order: any, paymentDetails?: any) => {
  if (order.payment_method !== 'multibanco' || !paymentDetails) return '';

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 1);
  const formattedExpiryDate = expiryDate.toLocaleDateString('pt-PT');

  // Format reference number in groups of 3
  const formattedReference = paymentDetails.reference
    ? paymentDetails.reference.match(/.{1,3}/g).join(' ')
    : '';

  return `
    <div class="section payment-details">
      <h2>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        Dados para Pagamento Multibanco
      </h2>
      <div class="info-row">
        <span>Entidade: </span>
        <strong>${paymentDetails.entity}</strong>
      </div>
      <div class="info-row">
        <span>Referência: </span>
        <strong>${formattedReference}</strong>
      </div>
      <div class="info-row">
        <span>Montante: </span>
        <strong>${Number(paymentDetails.amount).toFixed(2)}€</strong>
      </div>
      <div class="info-row">
        <span>Data Limite: </span>
        <strong>${formattedExpiryDate}</strong>
      </div>
      <div class="payment-warning">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        Por favor efetue o pagamento até à data limite indicada. Após este período, a referência será cancelada.
      </div>
    </div>
  `;
};