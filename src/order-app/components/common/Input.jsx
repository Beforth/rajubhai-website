import React, { useState } from 'react';

export const Input = ({
  label,
  error,
  icon = null,
  rightIcon = null,
  className = '',
  containerStyle = {},
  id,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...containerStyle }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.86rem',
            fontWeight: 700,
            color: 'var(--brand-maroon)',
            letterSpacing: '0.2px',
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)',
          border: error
            ? '1.5px solid var(--brand-red)'
            : isFocused
            ? '1.5px solid var(--brand-red)'
            : '1.5px solid var(--border-subtle)',
          boxShadow: isFocused ? '0 0 0 3px rgba(255, 9, 23, 0.12)' : 'none',
          borderRadius: 'var(--radius-md)',
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
          padding: '0 14px',
        }}
      >
        {icon && (
          <span style={{ color: 'var(--brand-orange)', display: 'flex', marginRight: '10px' }}>
            {icon}
          </span>
        )}

        <input
          id={inputId}
          style={{
            width: '100%',
            padding: '12px 0',
            border: 'none',
            outline: 'none',
            fontSize: '0.94rem',
            background: 'transparent',
            color: 'var(--text-dark)',
            fontFamily: 'inherit',
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {rightIcon && (
          <span style={{ display: 'flex', marginLeft: '8px', color: 'var(--text-muted)' }}>
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '0.78rem', color: 'var(--brand-red)', fontWeight: 600 }}>
          {error}
        </span>
      )}
    </div>
  );
};