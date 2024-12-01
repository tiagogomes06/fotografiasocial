export const createOrderDetailsSection = (order: any) => {
  const orderDate = new Date(order.created_at).toLocaleDateString('pt-PT');
  const totalAmount = Number(order.total_amount || 0).toFixed(2);

  return `
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
  `;
};