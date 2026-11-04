import React from 'react';
import { Minus, Plus } from 'lucide-react';

export const QuantityStepper = ({
  value = 1,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  disabled = false,
}) => {
  const handleDecrement = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (value > min) {
      onChange(value - 1);
    } else {
      onChange(0);
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (value < max) {
      onChange(value + 1);
    }
  };

  const isSmall = size === 'sm';
  const buttonSize = isSmall ? 24 : 30;
  const iconSize = isSmall ? 13 : 16;

  // Round buttons inside a padded pill, so the filled "+" never touches or gets clipped by the outline.
  const buttonStyle = {
    width: buttonSize,
    height: buttonSize,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background-color 0.15s ease',
    opacity: disabled ? 0.45 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? 2 : 4,
        padding: 3,
        backgroundColor: 'var(--bg-card)',
        border: '1.5px solid var(--brand-red)',
        borderRadius: 'var(--radius-full)',
      }}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled}
        style={{ ...buttonStyle, color: 'var(--brand-red)', backgroundColor: 'transparent' }}
        aria-label="Decrease quantity"
      >
        <Minus size={iconSize} strokeWidth={3} />
      </button>

      <span
        style={{
          fontWeight: 800,
          fontSize: isSmall ? '0.88rem' : '0.98rem',
          color: 'var(--text-dark)',
          minWidth: isSmall ? '20px' : '26px',
          textAlign: 'center',
        }}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled}
        style={{ ...buttonStyle, color: 'var(--text-white)', backgroundColor: 'var(--brand-red)' }}
        aria-label="Increase quantity"
      >
        <Plus size={iconSize} strokeWidth={3} />
      </button>
    </div>
  );
};
