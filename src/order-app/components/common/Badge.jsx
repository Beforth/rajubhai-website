import React from 'react';

export const Badge = ({
  children,
  variant = 'yellow', // 'yellow', 'red', 'orange', 'peach', 'veg'
  size = 'md',
  icon = null,
  style = {},
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'yellow':
        return {
          backgroundColor: 'var(--yellow)',
          color: 'var(--brown)',
          fontWeight: 700,
        };
      case 'red':
        return {
          backgroundColor: 'var(--red)',
          color: 'var(--white)',
          fontWeight: 600,
        };
      case 'orange':
        return {
          backgroundColor: 'var(--orange)',
          color: 'var(--white)',
          fontWeight: 600,
        };
      case 'peach':
        return {
          backgroundColor: 'var(--peach)',
          color: 'var(--brown)',
          fontWeight: 600,
        };
      default:
        return {
          backgroundColor: 'var(--yellow)',
          color: 'var(--brown)',
        };
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: size === 'sm' ? '2px 6px' : '4px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: size === 'sm' ? '0.72rem' : '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        ...getVariantStyles(),
        ...style,
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
};
