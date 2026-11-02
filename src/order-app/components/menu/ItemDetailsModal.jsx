import React, { useState } from 'react';
import { Plus, Check, Info } from 'lucide-react';
import { Modal } from '../common/Modal';
import { QuantityStepper } from '../common/QuantityStepper';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export const ItemDetailsModal = ({ item, isOpen, onClose }) => {
  if (!item) return null;

  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { addToast } = useToast();

  const [selectedSize, setSelectedSize] = useState(
    item.sizes && item.sizes.length > 0 ? item.sizes[0] : null
  );
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const calculateUnitTotal = () => {
    const sizeExtra = selectedSize ? selectedSize.price : 0;
    const addonsExtra = selectedAddons.reduce((sum, a) => sum + (a.price || 0), 0);
    return item.price + sizeExtra + addonsExtra;
  };

  const unitTotal = calculateUnitTotal();
  const totalAmount = unitTotal * quantity;

  const handleAddToCart = () => {
    addToCart(item, quantity, selectedSize, selectedAddons, instructions);
    addToast(`Added ${quantity}x ${item.name} to cart!`, 'success');
    onClose();
    // Open cart drawer after customizing so customer sees item immediately
    setIsCartDrawerOpen(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customize Your Dish" maxWidth="540px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header Preview */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: 86,
              height: 86,
              borderRadius: 'var(--radius-md)',
              objectFit: 'cover',
              border: '2px solid var(--border-subtle)',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span className="veg-stamp">
                <span className="veg-stamp-dot" />
              </span>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--brand-maroon)', margin: 0 }}>
                {item.name}
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              {item.description}
            </p>
            <div style={{ fontWeight: 800, color: 'var(--brand-red)', fontSize: '1.1rem', marginTop: 4 }}>
              Base Price: ₹{item.price}
            </div>
          </div>
        </div>

        {/* Sizes Selection */}
        {item.sizes && item.sizes.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--bg-soft)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                fontSize: '0.92rem',
                fontWeight: 800,
                color: 'var(--brand-maroon)',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Choose Size / Portion</span>
              <span style={{ fontSize: '0.74rem', color: 'var(--brand-red)', textTransform: 'uppercase' }}>
                Required
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {item.sizes.map((s) => {
                const isSelected = selectedSize?.name === s.name;
                return (
                  <label
                    key={s.name}
                    onClick={() => setSelectedSize(s)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#FFFFFF',
                      border: isSelected ? '2px solid var(--brand-red)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="radio"
                        name="size"
                        checked={isSelected}
                        onChange={() => setSelectedSize(s)}
                        style={{ accentColor: 'var(--brand-red)' }}
                      />
                      <span style={{ fontWeight: 700, color: 'var(--brand-maroon)', fontSize: '0.92rem' }}>
                        {s.name}
                      </span>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--brand-red)', fontSize: '0.9rem' }}>
                      {s.price === 0 ? 'Standard' : `+ ₹${s.price}`}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Add-ons */}
        {item.addons && item.addons.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '0.92rem',
                fontWeight: 800,
                color: 'var(--brand-maroon)',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Extra Add-ons</span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-light)' }}>Optional</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {item.addons.map((addon) => {
                const isChecked = selectedAddons.some((a) => a.id === addon.id);
                return (
                  <label
                    key={addon.id}
                    onClick={() => toggleAddon(addon)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#FFFFFF',
                      border: isChecked ? '2px solid var(--brand-orange)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAddon(addon)}
                        style={{ accentColor: 'var(--brand-orange)' }}
                      />
                      <span style={{ fontWeight: 600, color: 'var(--brand-maroon)', fontSize: '0.92rem' }}>
                        {addon.name}
                      </span>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--brand-maroon)', fontSize: '0.9rem' }}>
                      + ₹{addon.price}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        <div>
          <label
            style={{
              fontSize: '0.86rem',
              fontWeight: 700,
              color: 'var(--brand-maroon)',
              marginBottom: '6px',
              display: 'block',
            }}
          >
            Special Cooking Instructions
          </label>
          <textarea
            rows={2}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Less spicy, extra crunchy peanuts, separate sweet chutney..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.9rem',
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <QuantityStepper value={quantity} onChange={setQuantity} min={1} />

          <button
            onClick={handleAddToCart}
            className="btn-brand-primary"
            style={{ padding: '13px 26px', fontSize: '1rem' }}
          >
            Add to Cart • ₹{totalAmount}
          </button>
        </div>
      </div>
    </Modal>
  );
};
