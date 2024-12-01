export const createOrderDetailsSection = (order: any) => {
  const orderDate = new Date(order.created_at).toLocaleDateString('pt-PT');
  const totalAmount = Number(order.total_amount || 0).toFixed(2);

  return `
    <div class="section">
      <h2>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
        Detalhes da Encomenda
      </h2>
      <div class="info-row">
        <span>Número da Encomenda: </span>
        <strong>${order.id}</strong>
      </div>
      <div class="info-row">
        <span>Data: </span>
        <strong>${orderDate}</strong>
      </div>
      <div class="info-row">
        <span>Email: </span>
        <strong>${order.email}</strong>
      </div>
      ${order.tax_number ? `
      <div class="info-row">
        <span>NIF: </span>
        <strong>${order.tax_number}</strong>
      </div>
      ` : ''}
      <div class="info-row">
        <span>Total: </span>
        <strong>${totalAmount}€</strong>
      </div>
    </div>
  `;
};