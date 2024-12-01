export const createProductsSection = (order: any, isAdmin: boolean) => {
  const orderItems = order.order_items?.map((item: any) => ({
    quantity: item.quantity || 1,
    price: item.price_at_time || 0,
    name: item.products?.name || 'Fotografia',
    photoUrl: item.photos?.url || '',
  })) || [];

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
            <div style="margin-top: 10px;">
              <a href="${item.photoUrl}" class="photo-link">Ver Foto</a>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
};