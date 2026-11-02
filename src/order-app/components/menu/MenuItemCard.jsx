import React, { useState } from 'react';
import { Star, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { QuantityStepper } from '../common/QuantityStepper';

export const MenuItemCard = ({ item, onSelectCustomization }) => {
  const { cartItems, addToCart, updateQuantity, setIsCartDrawerOpen } = useCart();
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
      addToast(`Added ${item.name} to cart!`, 'success');
      // Auto-open or highlight cart drawer for intuitive customer feedback
      setIsCartDrawerOpen(true);
    }
  };

  return (
    <div
      className="food-card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: isCustomizable ? 'pointer' : 'default',
        height: '100%',
      }}
      onClick={() => {
        if (isCustomizable) onSelectCustomization(item);
      }}
    >
      {/* Food Photography Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 11',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-soft)',
        }}
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          className="food-card-img"
        />

        {/* Veg Stamp & Bestseller Badge */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span className="veg-stamp" style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}>
            <span className="veg-stamp-dot" />
          </span>

          {item.isBestseller && (
            <span
              style={{
                backgroundColor: 'var(--brand-yellow)',
                color: 'var(--brand-maroon)',
                fontSize: '0.74rem',
                fontWeight: 900,
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                letterSpacing: '0.3px',
              }}
            >
              ★ Bestseller
            </span>
          )}
        </div>

        {/* Rating tag */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            right: 12,
            backgroundColor: 'rgba(39, 23, 20, 0.88)',
            color: '#FFFFFF',
            padding: '3px 9px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.76rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            backdropFilter: 'blur(4px)',
          }}
        >
          <Star size={12} fill="var(--brand-yellow)" color="var(--brand-yellow)" />
          <span>{item.rating}</span>
          <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>({item.reviewCount})</span>
        </div>
      </div>

      {/* Card Content Area */}
      <div
        style={{
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1.12rem',
              fontWeight: 800,
              color: 'var(--brand-maroon)',
              lineHeight: 1.3,
              marginBottom: 4,
            }}
          >
            {item.name}
          </h3>

          {item.tagline && (
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--brand-orange)',
                marginBottom: 6,
              }}
            >
              {item.tagline}
            </div>
          )}

          <p
            style={{
              fontSize: '0.86rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: 0,
            }}
          >
            {item.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-subtle)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Price
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--brand-red)' }}>
              ₹{item.price}
            </div>
          </div>

          <div>
            {totalItemCount > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
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
                {isCustomizable && (
                  <span
                    onClick={() => onSelectCustomization(item)}
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--brand-orange)',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Customizable
                  </span>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                <button
                  onClick={handleAddClick}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid var(--brand-red)',
                    color: 'var(--brand-red)',
                    padding: '8px 20px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.18s ease',
                    boxShadow: '0 2px 8px rgba(229, 26, 27, 0.12)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--brand-red)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.color = 'var(--brand-red)';
                  }}
                >
                  <Plus size={16} strokeWidth={3} />
                  <span>ADD</span>
                </button>
                {isCustomizable && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600 }}>
                    Customizable
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
