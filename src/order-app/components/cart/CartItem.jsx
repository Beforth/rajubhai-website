import React from 'react';
import { Trash2 } from 'lucide-react';
import { QuantityStepper } from '../common/QuantityStepper';
import { useCart } from '../../context/CartContext';

export const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 0',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <img
        src={item.image}
        alt={item.name}
        style={{
          width: 72,
          height: 72,
          borderRadius: 'var(--radius-md)',
          objectFit: 'cover',
          backgroundColor: 'var(--bg-soft)',
          border: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          <span className="veg-stamp">
            <span className="veg-stamp-dot" />
          </span>
          <h4
            style={{
              fontSize: '0.96rem',
              color: 'var(--brand-maroon)',
              fontWeight: 800,
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              margin: 0,
            }}
          >
            {item.name}
          </h4>
        </div>

        {/* Selected size & addons */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
          {item.selectedSize && <strong>{item.selectedSize.name}</strong>}
          {item.selectedAddons && item.selectedAddons.length > 0 && (
            <span style={{ color: 'var(--brand-orange)' }}>
              {' '}
              + {item.selectedAddons.map((a) => a.name).join(', ')}
            </span>
          )}
          {item.instructions && (
            <div style={{ fontStyle: 'italic', color: 'var(--brand-red)', marginTop: '2px', fontSize: '0.76rem' }}>
              Note: "{item.instructions}"
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ fontWeight: 900, color: 'var(--brand-red)', fontSize: '1.05rem' }}>
            ₹{item.itemTotal}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QuantityStepper
              value={item.quantity}
              onChange={(newQty) => updateQuantity(item.cartKey, newQty)}
              size="sm"
            />
            <button
              onClick={() => removeFromCart(item.cartKey)}
              style={{
                color: 'var(--text-light)',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s',
              }}
              title="Remove item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
