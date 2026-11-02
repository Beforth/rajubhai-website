import React from 'react';
import { Minus, Plus } from 'lucide-react';

export const QuantityStepper = ({
  value = 1,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
}) => {
  const handleDecrement = (e) => {
    e.stopPropagation();
    if (value > min) {
      onChange(value - 1);
    } else {
      onChange(0);
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (value < max) {
      onChange(value + 1);
    }
  };

  const isSmall = size === 'sm';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        border: '1.5px solid var(--brand-red)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(229, 26, 27, 0.12)',
      }}
    >
      <button
        onClick={handleDecrement}
        style={{
          padding: isSmall ? '4px 8px' : '6px 12px',
          color: 'var(--brand-red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          transition: 'background-color 0.15s ease',
        }}
        aria-label="Decrease quantity"
      >
        <Minus size={isSmall ? 13 : 16} strokeWidth={3} />
      </button>

      <span
        style={{
          padding: isSmall ? '0 8px' : '0 12px',
          fontWeight: 900,
          fontSize: isSmall ? '0.88rem' : '0.98rem',
          color: 'var(--brand-maroon)',
          minWidth: isSmall ? '24px' : '30px',
          textAlign: 'center',
        }}
      >
        {value}
      </span>

      <button
        onClick={handleIncrement}
        style={{
          padding: isSmall ? '4px 8px' : '6px 12px',
          color: '#FFFFFF',
          backgroundColor: 'var(--brand-red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.15s ease',
        }}
        aria-label="Increase quantity"
      >
        <Plus size={isSmall ? 13 : 16} strokeWidth={3} />
      </button>
    </div>
  );
};
