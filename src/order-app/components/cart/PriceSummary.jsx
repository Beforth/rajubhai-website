import React from 'react';
import { useCart } from '../../context/CartContext';

export const PriceSummary = ({ compact = false }) => {
  const { subtotal, gst, packaging, deliveryFee, discount, grandTotal, orderType } = useCart();

  // Safe numerical display helpers
  const safeSubtotal = Number(subtotal) || 0;
  const safeGst = Number(gst) || 0;
  const safePackaging = Number(packaging) || 0;
  const safeDelivery = Number(deliveryFee) || 0;
  const safeDiscount = Number(discount) || 0;
  const safeGrandTotal = Number(grandTotal) || 0;

  return (
    <div
      style={
        compact
          ? {}
          : {
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              border: '1.5px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }
      }
    >
      <div
        style={{
          fontSize: '1rem',
          fontWeight: 800,
          color: 'var(--brand-maroon)',
          marginBottom: '14px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '8px',
        }}
      >
        Bill Details & Charges
      </div>

      {/* Itemized charges with guaranteed safe numbers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dark)' }}>
          <span>Item Total</span>
          <span style={{ fontWeight: 800 }}>₹{safeSubtotal}</span>
        </div>

        {safeDiscount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32' }}>
            <span>Discount Applied</span>
            <span style={{ fontWeight: 800 }}>- ₹{safeDiscount}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>Taxes (5% GST)</span>
          <span>₹{safeGst}</span>
        </div>

        {safePackaging > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Packaging & Bag</span>
            <span>₹{safePackaging}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span>
            {orderType === 'delivery'
              ? 'Delivery Partner Fee'
              : orderType === 'pickup'
              ? 'Store Takeaway'
              : 'Dine-In Table Service'}
          </span>
          <span>{safeDelivery === 0 ? <strong style={{ color: '#2e7d32' }}>FREE</strong> : `₹${safeDelivery}`}</span>
        </div>

        <div
          style={{
            borderTop: '1.5px solid var(--border-subtle)',
            paddingTop: '14px',
            marginTop: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <div>
            <div style={{ fontSize: '0.98rem', fontWeight: 900, color: 'var(--brand-maroon)' }}>
              Total Amount To Pay
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Inclusive of all taxes & charges
            </div>
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--brand-red)', letterSpacing: '-0.4px' }}>
            ₹{safeGrandTotal}
          </span>
        </div>
      </div>
    </div>
  );
};