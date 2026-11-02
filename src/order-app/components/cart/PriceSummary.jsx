import React, { useState } from 'react';
import { Tag, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { applyCoupon } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const PriceSummary = ({ showCouponSection = true }) => {
  const { subtotal, gst, packaging, deliveryFee, discount, grandTotal, appliedCoupon, setAppliedCoupon, orderType } = useCart();
  const { addToast } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  // Safe numerical display helpers
  const safeSubtotal = Number(subtotal) || 0;
  const safeGst = Number(gst) || 0;
  const safePackaging = Number(packaging) || 0;
  const safeDelivery = Number(deliveryFee) || 0;
  const safeDiscount = Number(discount) || 0;
  const safeGrandTotal = Number(grandTotal) || 0;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setLoadingCoupon(true);
    try {
      const res = await applyCoupon(couponInput, safeSubtotal);
      if (res.success) {
        setAppliedCoupon(res);
        addToast(res.message, 'success');
        setCouponInput('');
      } else {
        addToast(res.message, 'error');
      }
    } catch {
      addToast('Failed to apply coupon', 'error');
    } finally {
      setLoadingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Coupon removed', 'info');
  };

  return (
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
          fontSize: '1.1rem',
          fontWeight: 800,
          color: 'var(--brand-maroon)',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '10px',
        }}
      >
        Bill Details & Charges
      </div>

      {showCouponSection && (
        <div style={{ marginBottom: '20px' }}>
          {appliedCoupon ? (
            <div
              style={{
                backgroundColor: 'var(--bg-soft)',
                border: '1.5px dashed var(--brand-red)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={18} color="var(--brand-red)" />
                <div>
                  <strong style={{ color: 'var(--brand-maroon)', fontSize: '0.92rem' }}>
                    {appliedCoupon.code}
                  </strong>
                  <div style={{ fontSize: '0.8rem', color: '#2e7d32', fontWeight: 700 }}>
                    Savings Applied: -₹{Number(appliedCoupon.discountAmount) || 0}
                  </div>
                </div>
              </div>
              <button
                onClick={removeCoupon}
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--brand-red)',
                  fontWeight: 800,
                  textDecoration: 'underline',
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-soft)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0 14px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Tag size={15} color="var(--brand-orange)" style={{ marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Enter Promo Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    width: '100%',
                    padding: '10px 0',
                    fontSize: '0.88rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    color: 'var(--text-dark)',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loadingCoupon || !couponInput.trim()}
                style={{
                  backgroundColor: 'var(--brand-maroon)',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  opacity: !couponInput.trim() ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {loadingCoupon ? 'Checking...' : 'Apply'}
              </button>
            </form>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            <span
              onClick={() => setCouponInput('RAJUBHAI1987')}
              style={{
                fontSize: '0.74rem',
                backgroundColor: 'var(--brand-yellow)',
                color: 'var(--brand-maroon)',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
              }}
            >
              RAJUBHAI1987 (20% OFF)
            </span>
            <span
              onClick={() => setCouponInput('FREESHIP')}
              style={{
                fontSize: '0.74rem',
                backgroundColor: 'var(--bg-soft)',
                color: 'var(--brand-maroon)',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
              }}
            >
              FREESHIP
            </span>
          </div>
        </div>
      )}

      {/* Itemized charges with guaranteed safe numbers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.92rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dark)' }}>
          <span>Item Total</span>
          <span style={{ fontWeight: 800 }}>₹{safeSubtotal}</span>
        </div>

        {safeDiscount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32' }}>
            <span>Coupon Discount</span>
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
            paddingTop: '16px',
            marginTop: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--brand-maroon)' }}>
              Total Amount To Pay
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Inclusive of all taxes & charges
            </div>
          </div>
          <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--brand-red)', letterSpacing: '-0.5px' }}>
            ₹{safeGrandTotal}
          </span>
        </div>
      </div>
    </div>
  );
};
