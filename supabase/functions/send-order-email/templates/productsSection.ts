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
            <div class="photo-link-container">
              <a href="${item.photoUrl}" class="photo-link" target="_blank">Ver Foto</a>
            </div>
          ` : ''}
        </div>
      `).join('')}
      
      <div class="totals-section" style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
        <div class="info-row">
          <span>Subtotal:</span>
          <strong>${subtotal.toFixed(2)}€</strong>
        </div>
        <div class="info-row">
          <span>Portes de Envio:</span>
          <strong>${shippingCost.toFixed(2)}€</strong>
        </div>
        <div class="info-row" style="font-size: 1.1em; margin-top: 10px;">
          <span>Total:</span>
          <strong>${total.toFixed(2)}€</strong>
        </div>
      </div>
    </div>
  `;
};