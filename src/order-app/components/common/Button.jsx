import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' (red), 'secondary' (orange), 'outline', 'ghost', 'yellow'
  size = 'md', // 'sm', 'md', 'lg'
  fullWidth = false,
  loading = false,
  disabled = false,
  icon = null,
  onClick,
  type = 'button',
  className = '',
  style = {},
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--red)',
          color: 'var(--white)',
          border: 'none',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--orange)',
          color: 'var(--white)',
          border: 'none',
        };
      case 'yellow':
        return {
          backgroundColor: 'var(--yellow)',
          color: 'var(--brown)',
          fontWeight: 700,
          border: 'none',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--brown)',
          border: '1.5px solid var(--brown)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--brown)',
          border: 'none',
        };
      default:
        return {
          backgroundColor: 'var(--red)',
          color: 'var(--white)',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '0.85rem' };
      case 'lg':
        return { padding: '14px 28px', fontSize: '1.05rem', fontWeight: 700 };
      case 'md':
      default:
        return { padding: '10px 18px', fontSize: '0.95rem' };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: 'var(--radius-md)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.18s ease-in-out',
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'inherit',
        fontWeight: 600,
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      className={`btn-custom ${className}`}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: 16,
            height: 16,
            border: '2px solid rgba(255,255,255,0.4)',
            borderTopColor: 'var(--white)',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : (
        icon && <span style={{ display: 'inline-flex' }}>{icon}</span>
      )}
      {children}
    </button>
  );
};
