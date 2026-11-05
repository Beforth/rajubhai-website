import React from 'react';
import { useCart } from '../../context/CartContext';

// Why Checkout is disabled (closed outlet, minimum order, unavailable lines), straight from the server.
export const CheckoutNotice = () => {
  const { checkout } = useCart();
  if (checkout.pending) {
    return (
      <div role="status" aria-live="polite" style={{ marginTop: 10, fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)' }}>
        Updating total…
      </div>
    );
  }
  if (!checkout.reason) return null;
  return (
    <div
      role="alert"
      style={{
        marginTop: 10,
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-soft)',
        border: '1px solid var(--brand-red)',
        color: 'var(--brand-red)',
        fontSize: '0.84rem',
        fontWeight: 700,
      }}
    >
      {checkout.reason}
    </div>
  );
};
