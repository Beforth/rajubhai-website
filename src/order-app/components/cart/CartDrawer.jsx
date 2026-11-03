import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Drawer } from '../common/Drawer';
import { CartItem } from './CartItem';
import { PriceSummary } from './PriceSummary';
import { CheckoutNotice } from './CheckoutNotice';
import { formatMoney } from '../../services/money';
import { EmptyState } from '../common/EmptyState';

export const CartDrawer = () => {
  const { isCartDrawerOpen, setIsCartDrawerOpen, cartItems, grandTotal, itemCount, checkout } = useCart();
  const navigate = useNavigate();

  const handleProceedCheckout = () => {
    setIsCartDrawerOpen(false);
    navigate('/checkout');
  };

  const handleGoToMenu = () => {
    setIsCartDrawerOpen(false);
    navigate('/menu');
  };

  return (
    <Drawer
      isOpen={isCartDrawerOpen}
      onClose={() => setIsCartDrawerOpen(false)}
      title={`Your Food Cart (${itemCount})`}
      width="460px"
    >
      {cartItems.length === 0 ? (
        <div style={{ padding: '32px 20px', flex: 1, display: 'flex', alignItems: 'center' }}>
          <EmptyState
            icon={<ShoppingBag size={44} color="var(--brand-red)" />}
            title="Your Cart is Empty"
            description="Explore our authentic Kutch dabelis, grilled sandwiches, and crunchy chaat."
            actionText="Browse Dabeli & Chaat"
            onAction={handleGoToMenu}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-page)' }}>
          {/* Top Brand Assurance Pill */}
          <div
            style={{
              backgroundColor: 'var(--brand-yellow)',
              color: 'var(--brand-maroon)',
              padding: '8px 20px',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color="var(--brand-red)" />
              <span>Annapurna's Kitchen Ready</span>
            </div>
            <span>Fresh Tava Preparation</span>
          </div>

          {/* Cart Items List & Price Summary */}
          <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 18px',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: 'var(--brand-maroon)',
                  marginBottom: '8px',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '8px',
                }}
              >
                Selected Food Items
              </div>
              {cartItems.map((item) => (
                <CartItem key={item.cartKey} item={item} />
              ))}
            </div>

            <PriceSummary />
          </div>

          {/* Sticky Footer Checkout Bar */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: '2px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 -6px 20px rgba(43, 23, 18, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total To Pay
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brand-red)', letterSpacing: '-0.5px' }}>
                  {grandTotal ? formatMoney(grandTotal) : '…'}
                </div>
              </div>

              <button
                onClick={handleProceedCheckout}
                disabled={!checkout.canCheckout}
                className="btn-brand-primary"
                style={{
                  padding: '13px 26px',
                  fontSize: '1rem',
                  boxShadow: '0 4px 16px rgba(255, 9, 23, 0.35)',
                }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <CheckoutNotice />
          </div>
        </div>
      )}
    </Drawer>
  );
};
