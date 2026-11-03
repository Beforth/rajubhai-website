import React from 'react';
import { useCart } from '../../context/CartContext';
import { formatMoney } from '../../services/money';

const row = { display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' };

// Every figure is the server's quote; nothing is calculated here. While the quote is loading
// the rows show "…" so a wrong number is never displayed.
export const PriceSummary = ({ compact = false }) => {
  const { quote, quoteLoading, quoteError, refreshQuote } = useCart();
  const pending = quoteLoading || (!quote && !quoteError);
  const value = (v) => (pending ? <span aria-label="Calculating">…</span> : formatMoney(v));
  const hasAmount = (v) => v !== undefined && v !== null && Number(v) !== 0;

  return (
    <div
      style={
        compact
          ? {}
          : {
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              border: '1.5px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }
      }
    >
      <div
        style={{
          fontSize: '1rem',
          fontWeight: 800,
          color: 'var(--brand-maroon)',
          marginBottom: '14px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '8px',
        }}
      >
        Bill Details & Charges
      </div>

      {quoteError ? (
        <div style={{ fontSize: '0.86rem', color: 'var(--brand-red)' }}>
          <div>{quoteError.message}</div>
          <button
            type="button"
            onClick={refreshQuote}
            style={{ marginTop: 8, fontWeight: 800, color: 'var(--brand-maroon)', textDecoration: 'underline' }}
          >
            Try again
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
          <div style={{ ...row, color: 'var(--text-dark)' }}>
            <span>Item Total</span>
            <span style={{ fontWeight: 800 }}>{value(quote?.subtotal)}</span>
          </div>

          {(pending || hasAmount(quote?.container_charge)) && (
            <div style={row}>
              <span>Packaging & Container</span>
              <span>{value(quote?.container_charge)}</span>
            </div>
          )}

          <div style={row}>
            <span>Delivery Fee</span>
            <span>
              {pending ? (
                '…'
              ) : hasAmount(quote.delivery_charge) ? (
                formatMoney(quote.delivery_charge)
              ) : (
                <strong style={{ color: 'var(--brand-orange)' }}>FREE</strong>
              )}
            </span>
          </div>

          {!pending &&
            (quote.tax_breakdown || []).map((t, i) => (
              <div key={`${t.label}-${t.mode}-${i}`} style={row}>
                <span>
                  {t.label}
                  {t.mode === 'backward' ? ' (included)' : ''}
                </span>
                <span>{formatMoney(t.amount)}</span>
              </div>
            ))}

          <div
            style={{
              borderTop: '1.5px solid var(--border-subtle)',
              paddingTop: '14px',
              marginTop: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, color: 'var(--brand-maroon)' }}>Total Amount To Pay</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {pending ? 'Calculating…' : 'Inclusive of all taxes & charges'}
              </div>
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--brand-red)', letterSpacing: '-0.4px' }}>
              {value(quote?.grand_total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
