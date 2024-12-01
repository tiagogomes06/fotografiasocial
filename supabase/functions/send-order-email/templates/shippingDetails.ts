export const createShippingSection = (order: any) => {
  if (!order.shipping_method_id) return '';
  
  const shippingMethod = order.shipping_methods || { name: '', price: 0 };
  
  return `
    <div class="section">
      <h2>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        Detalhes de Envio
      </h2>
      <div class="info-row">
        <span>Método: </span>
        <strong>${shippingMethod.name}</strong>
      </div>
      <div class="info-row">
        <span>Nome: </span>
        <strong>${order.shipping_name || ''}</strong>
      </div>
      ${order.shipping_address ? `
        <div class="info-row">
          <span>Morada: </span>
          <strong>${order.shipping_address}</strong>
        </div>
      ` : ''}
      ${order.shipping_postal_code ? `
        <div class="info-row">
          <span>Código Postal: </span>
          <strong>${order.shipping_postal_code}</strong>
        </div>
      ` : ''}
      ${order.shipping_city ? `
        <div class="info-row">
          <span>Cidade: </span>
          <strong>${order.shipping_city}</strong>
        </div>
      ` : ''}
      <div class="info-row">
        <span>Telefone: </span>
        <strong>${order.shipping_phone || ''}</strong>
      </div>
    </div>
  `;
};