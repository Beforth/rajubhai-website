import React from 'react';

export const Loader = ({ text = 'Loading freshly prepared food...', fullPage = false }) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        gap: '14px',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          border: '4px solid var(--peach)',
          borderTopColor: 'var(--red)',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }}
      />
      {text && (
        <p style={{ color: 'var(--brown)', fontSize: '0.95rem', fontWeight: 600 }}>
          {text}
        </p>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(255, 253, 249, 0.9)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};
