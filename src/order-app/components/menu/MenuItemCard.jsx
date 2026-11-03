import React from 'react';
import { Star, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { QuantityStepper } from '../common/QuantityStepper';

export const MenuItemCard = ({ item, onSelectCustomization }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { addToast } = useToast();

  const matchingCartItems = cartItems.filter((ci) => ci.id === item.id);
  const totalItemCount = matchingCartItems.reduce((acc, ci) => acc + ci.quantity, 0);

  const isCustomizable =
    (item.sizes && item.sizes.length > 1) || (item.addons && item.addons.length > 0);

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (isCustomizable) {
      onSelectCustomization(item);
    } else {
      addToCart(item, 1);
      addToast(`Added ${item.name} to order!`, 'success');
    }
  };

  return (
    <article
      className="menu-item-row"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        gap: '16px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        border: '1.5px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        cursor: isCustomizable ? 'pointer' : 'default',
        position: 'relative',
      }}
      onClick={() => {
        if (isCustomizable) onSelectCustomization(item);
      }}
    >
      {/* Left: Dish Information */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
          minWidth: 0,
          gap: '8px',
        }}
      >
        <div>
          {/* Badges Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span className="veg-stamp" aria-label="Vegetarian">
              <span className="veg-stamp-dot" />
            </span>

            {item.isBestseller && (
              <span
                style={{
                  backgroundColor: 'var(--brand-yellow)',
                  color: 'var(--brand-maroon)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.2px',
                }}
              >
                ★ Bestseller
              </span>
            )}

            {item.rating && (
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Star size={11} fill="var(--brand-orange)" color="var(--brand-orange)" />
                <span>{item.rating}</span>
                {item.reviewCount && <span style={{ opacity: 0.7 }}>({item.reviewCount})</span>}
              </span>
            )}
          </div>

          {/* Dish Title */}
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--brand-maroon)',
              lineHeight: 1.3,
              margin: '0 0 4px 0',
            }}
          >
            {item.name}
          </h3>

          {/* Tagline */}
          {item.tagline && (
            <div
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                color: 'var(--brand-orange)',
                marginBottom: '4px',
              }}
            >
              {item.tagline}
            </div>
          )}

          {/* Description */}
          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </p>
        </div>

        {/* Price & Customization Note */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
          <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--brand-red)' }}>
            ₹{item.price}
          </span>
          {isCustomizable && (
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-light)',
                fontWeight: 600,
              }}
            >
              Customisable
            </span>
          )}
        </div>
      </div>

      {/* Right: Food Image & Add Action */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          width: '118px',
          gap: '8px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: '118px',
            height: '96px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-soft)',
            position: 'relative',
            boxShadow: '0 2px 6px rgba(43, 23, 18, 0.08)',
          }}
        >
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
            }}
            className="menu-thumb-img"
          />
        </div>

        {/* Action Button / Quantity Stepper */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {totalItemCount > 0 ? (
            <QuantityStepper
              value={totalItemCount}
              onChange={(newQty) => {
                if (matchingCartItems.length === 1) {
                  updateQuantity(matchingCartItems[0].cartKey, newQty);
                } else {
                  onSelectCustomization(item);
                }
              }}
              size="sm"
            />
          ) : (
            <button
              type="button"
              onClick={handleAddClick}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--brand-red)',
                color: 'var(--brand-red)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                boxShadow: '0 2px 6px rgba(255, 9, 23, 0.12)',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brand-red)';
                e.currentTarget.style.color = 'var(--text-white)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                e.currentTarget.style.color = 'var(--brand-red)';
              }}
              aria-label={`Add ${item.name} to cart`}
            >
              <Plus size={14} strokeWidth={2.8} />
              <span>ADD</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};