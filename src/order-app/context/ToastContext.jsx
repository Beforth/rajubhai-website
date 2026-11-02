import React, { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: 24,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
          maxWidth: 'calc(100vw - 40px)',
        }}
      >
        {toasts.map((toast) => {
          let bg = 'var(--brown)';
          let color = 'var(--white)';
          let border = '1px solid rgba(255,255,255,0.2)';

          if (toast.type === 'success') {
            bg = '#1b5e20';
            border = '1px solid #4caf50';
          } else if (toast.type === 'error') {
            bg = 'var(--red)';
            border = '1px solid #b71c1c';
          } else if (toast.type === 'warning') {
            bg = 'var(--orange)';
          }

          return (
            <div
              key={toast.id}
              onClick={() => removeToast(toast.id)}
              style={{
                pointerEvents: 'auto',
                background: bg,
                color,
                border,
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                fontSize: '0.92rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                animation: 'fadeIn 0.25s ease-out',
              }}
            >
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
