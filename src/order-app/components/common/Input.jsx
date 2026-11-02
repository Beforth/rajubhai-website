import React from 'react';

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
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...containerStyle }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.88rem',
            fontWeight: 600,
            color: 'var(--text-dark)',
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
          border: error ? '1.5px solid var(--brand-red)' : '1.5px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          padding: '0 12px',
        }}
      >
        {icon && (
          <span style={{ color: 'var(--brand-orange)', display: 'flex', marginRight: '8px' }}>
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
            fontSize: '0.95rem',
            background: 'transparent',
            color: 'var(--text-dark)',
          }}
          {...props}
        />

        {rightIcon && (
          <span style={{ display: 'flex', marginLeft: '8px', color: 'var(--text-muted)' }}>
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '0.8rem', color: 'var(--brand-red)', fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
};
