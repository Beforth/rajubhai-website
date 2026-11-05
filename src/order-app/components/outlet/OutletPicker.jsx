import React from 'react';
import { MapPin, Phone } from 'lucide-react';
import { useOutlet } from '../../context/OutletContext';
import { useSwitchOutlet } from '../../hooks/useSwitchOutlet';

export const OutletPicker = () => {
  const { outlets, outletId } = useOutlet();
  const switchOutlet = useSwitchOutlet();

  return (
    <section aria-label="Choose an outlet" style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 640 }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Choose your outlet</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Menus and prices are per outlet. Pick the one nearest to you.
        </p>
      </div>
      {outlets.map((o) => {
        const selected = o.id === outletId;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => switchOutlet(o.id)}
            style={{
              textAlign: 'left',
              backgroundColor: 'var(--bg-card)',
              border: selected ? '2px solid var(--brand-red)' : '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 18px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              cursor: 'pointer',
              color: 'var(--text-dark)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <strong style={{ fontSize: '1.05rem', color: 'var(--brand-maroon)' }}>{o.name}</strong>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: o.is_open ? 'var(--brand-yellow)' : 'var(--bg-soft)',
                  color: o.is_open ? 'var(--brand-maroon)' : 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {o.is_open ? 'Open' : 'Closed'}
              </span>
            </span>
            {o.address && (
              <span style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                <MapPin size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                {o.address}
              </span>
            )}
            {o.phone && (
              <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                <Phone size={14} />
                {o.phone}
              </span>
            )}
          </button>
        );
      })}
    </section>
  );
};
