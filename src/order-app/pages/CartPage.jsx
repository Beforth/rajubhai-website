import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingBag, Trash2, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CartItem } from '../components/cart/CartItem';
import { PriceSummary } from '../components/cart/PriceSummary';
import { EmptyState } from '../components/common/EmptyState';

export const CartPage = () => {
  const { cartItems, itemCount, clearCart, grandTotal, orderType, setOrderType } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="page-shell">
        <EmptyState
          icon={<ShoppingBag size={48} color="var(--brand-red)" />}
          title="Your Cart is Empty"
          description="Looks like you haven't added anything from Annapurna's Rajubhai Dabeliwale yet."
          actionText="Browse Dabeli & Chaat Menu"
          onAction={() => navigate('/menu')}
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      {/* Back button */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          to="/menu"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--brand-maroon)',
            fontWeight: 800,
            fontSize: '0.92rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: 'var(--brand-maroon)', letterSpacing: '-0.6px', margin: 0 }}>
            Your Shopping Cart
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: 4 }}>
            Review items, customize portions, and choose fulfillment mode.
          </p>
        </div>

        <button
          onClick={clearCart}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--brand-red)',
            fontSize: '0.88rem',
            fontWeight: 800,
            backgroundColor: 'var(--bg-soft)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Trash2 size={16} />
          <span>Empty Cart</span>
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '36px',
          alignItems: 'flex-start',
        }}
      >
        {/* Left Column: Dining Mode & Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Order Type Switcher */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              border: '1.5px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--brand-maroon)', marginBottom: '12px' }}>
              Select Ordering Mode
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { id: 'delivery', label: 'Door Delivery' },
                { id: 'pickup', label: 'Takeaway' },
                { id: 'dinein', label: 'Dine-In Table' },
              ].map((type) => {
                const isSelected = orderType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setOrderType(type.id)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      textAlign: 'center',
                      backgroundColor: isSelected ? 'var(--brand-red)' : 'var(--bg-soft)',
                      color: isSelected ? '#FFFFFF' : 'var(--brand-maroon)',
                      border: isSelected ? '1.5px solid var(--brand-red)' : '1px solid var(--border-subtle)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cart Items List */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1.5px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--brand-maroon)',
                marginBottom: '16px',
                borderBottom: '1.5px solid var(--border-subtle)',
                paddingBottom: '10px',
              }}
            >
              Order Dishes ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </div>
            {cartItems.map((item) => (
              <CartItem key={item.cartKey} item={item} />
            ))}
          </div>
        </div>

        {/* Right Column: Price Summary & Checkout Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: 96 }}>
          <PriceSummary showCouponSection={true} />

          <button
            onClick={() => navigate('/checkout')}
            className="btn-brand-primary"
            style={{
              width: '100%',
              padding: '16px 28px',
              fontSize: '1.08rem',
              fontWeight: 800,
            }}
          >
            <span>Proceed to Checkout • ₹{grandTotal}</span>
            <ArrowRight size={20} />
          </button>

          <div
            style={{
              backgroundColor: 'var(--bg-soft)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.82rem',
              color: 'var(--brand-maroon)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <ShieldCheck size={20} color="var(--brand-red)" style={{ flexShrink: 0 }} />
            <span>
              <strong>100% Satisfaction Guarantee:</strong> Cooked live on iron tawa with pure Amul butter.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
