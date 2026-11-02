import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon = null,
  title = 'No items found',
  description = 'Looks like we couldn’t find what you are looking for.',
  actionText = null,
  onAction = null,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 20px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-peach-light)',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px dashed var(--peach)',
        margin: '20px 0',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--orange)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 16,
        }}
      >
        {icon || <UtensilsCrossed size={36} />}
      </div>

      <h3 style={{ fontSize: '1.25rem', color: 'var(--brown)', marginBottom: 8 }}>
        {title}
      </h3>
      <p
        style={{
          color: 'var(--text-muted)',
          maxWidth: '380px',
          fontSize: '0.92rem',
          marginBottom: actionText ? 20 : 0,
        }}
      >
        {description}
      </p>

      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
