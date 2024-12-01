export const emailStyles = `
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #1F2937;
    margin: 0;
    padding: 0;
    background-color: #F3F4F6;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #FFFFFF;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  .header {
    text-align: center;
    margin-bottom: 40px;
    padding: 24px;
    background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
    border-radius: 12px;
    color: white;
  }
  .header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .section {
    background-color: #F9FAFB;
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 24px;
    border: 1px solid #E5E7EB;
  }
  .section h2 {
    color: #4B5563;
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section h2 svg {
    width: 20px;
    height: 20px;
    color: #8B5CF6;
  }
  .info-row {
    margin: 12px 0;
    color: #6B7280;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #F3F4F6;
  }
  .info-row:last-child {
    border-bottom: none;
  }
  .info-row strong {
    color: #1F2937;
    font-weight: 500;
  }
  .product-item {
    background-color: white;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .product-item h3 {
    margin: 0 0 12px 0;
    color: #1F2937;
    font-size: 16px;
    font-weight: 600;
  }
  .payment-details {
    background-color: #FEF3C7;
    border: 1px solid #FCD34D;
  }
  .payment-warning {
    margin-top: 16px;
    padding: 12px;
    background-color: #FFFBEB;
    border-radius: 8px;
    text-align: center;
    color: #92400E;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .payment-warning svg {
    width: 16px;
    height: 16px;
    color: #92400E;
  }
  .footer {
    margin-top: 32px;
    padding: 24px;
    background-color: #F9FAFB;
    border-radius: 12px;
    text-align: center;
    color: #6B7280;
    font-size: 14px;
  }
  .status-message {
    background-color: #EFF6FF;
    color: #1D4ED8;
    padding: 16px;
    border-radius: 12px;
    margin: 24px 0;
    text-align: center;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .status-message svg {
    width: 20px;
    height: 20px;
  }
  .totals-section {
    margin-top: 24px;
    border-top: 2px solid #E5E7EB;
    padding-top: 16px;
  }
  .totals-section .info-row:last-child {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 2px solid #E5E7EB;
    font-weight: 600;
  }
  .photo-link-container {
    margin-top: 12px;
    text-align: center;
  }
  .photo-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background-color: #8B5CF6;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  .photo-link:hover {
    background-color: #7C3AED;
  }
  .photo-link svg {
    width: 16px;
    height: 16px;
  }
`;