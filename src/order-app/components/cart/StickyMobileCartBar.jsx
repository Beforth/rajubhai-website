import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLocation } from 'react-router-dom';

export const StickyMobileCartBar = () => {
  const { itemCount, grandTotal, setIsCartDrawerOpen } = useCart();
  const location = useLocation();

  if (
    itemCount === 0 ||
    location.pathname === '/checkout' ||
    location.pathname === '/cart'
  ) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        zIndex: 900,
        maxWidth: '520px',
        margin: '0 auto',
      }}
    >
      <div
        onClick={() => setIsCartDrawerOpen(true)}
        style={{
          backgroundColor: 'var(--brand-red)',
          color: '#FFFFFF',
          padding: '14px 22px',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 8px 28px rgba(229, 26, 27, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              backgroundColor: 'var(--brand-yellow)',
              color: 'var(--brand-maroon)',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.92rem',
            }}
          >
            {itemCount}
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>
              View Cart
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.15rem' }}>
              ₹{grandTotal}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.95rem' }}>
          <span>Order Now</span>
          <ArrowRight size={18} />
        </div>
      </div>
    </div>
  );
};
