export const createProductsSection = (order: any, isAdmin: boolean) => {
  const orderItems = order.order_items?.map((item: any) => ({
    quantity: item.quantity || 1,
    price: item.price_at_time || 0,
    name: item.products?.name || 'Fotografia',
    photoUrl: item.photos?.url || '',
  })) || [];

  const subtotal = orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const shippingCost = order.shipping_methods?.price || 0;
  const total = subtotal + shippingCost;

  return `
    <div class="section">
      <h2>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
        Produtos
      </h2>
      ${orderItems.map((item: any) => `
        <div class="product-item">
          <h3>${item.name}</h3>
          <div class="info-row">
            <span>Quantidade: </span>
            <strong>${item.quantity}</strong>
          </div>
          <div class="info-row">
            <span>Preço: </span>
            <strong>${Number(item.price).toFixed(2)}€</strong>
          </div>
          ${isAdmin && item.photoUrl ? `
            <div class="photo-link-container">
              <a href="${item.photoUrl}" class="photo-link" target="_blank">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7l-5-5z"/><path d="M14 2v5h5"/></svg>
                Ver Foto
              </a>
            </div>
          ` : ''}
        </div>
      `).join('')}
      
      <div class="totals-section">
        <div class="info-row">
          <span>Subtotal: </span>
          <strong>${subtotal.toFixed(2)}€</strong>
        </div>
        <div class="info-row">
          <span>Portes de Envio: </span>
          <strong>${shippingCost.toFixed(2)}€</strong>
        </div>
        <div class="info-row">
          <span>Total: </span>
          <strong>${total.toFixed(2)}€</strong>
        </div>
      </div>
    </div>
  `;
};