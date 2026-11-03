import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Clock, Phone, Printer, XCircle, AlertTriangle, SearchX } from 'lucide-react';
import { shopApi } from '../services/shopApi';
import { pollDelay, STEPPER_STEP } from '../services/orderStatus';
import { formatMoney } from '../services/money';
import { useOutlet } from '../context/OutletContext';
import { OrderStatusStepper } from '../components/common/OrderStatusStepper';
import { Loader } from '../components/common/Loader';

const card = {
  backgroundColor: 'var(--bg-card)',
  borderRadius: 'var(--radius-lg)',
  padding: '24px',
  border: '1.5px solid var(--border-subtle)',
  boxShadow: 'var(--shadow-sm)',
};

const pad = (n) => String(n).padStart(2, '0');
const countdownText = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
};

// Headline copy per server status.
const HEADLINES = {
  received: { title: 'Order Received', text: 'Waiting for the restaurant to accept your order.' },
  accepted: { title: 'Order Accepted', text: 'The restaurant has accepted your order.' },
  preparing: { title: 'Preparing Your Order', text: 'Your food is being prepared.' },
  ready: { title: 'Order Ready', text: 'Your order is ready.' },
  out_for_delivery: { title: 'Out for Delivery', text: 'Your order is on its way.' },
  delivered: { title: 'Delivered', text: 'Enjoy your meal!' },
};

export const OrderTracking = () => {
  const { publicId } = useParams();
  const { info } = useOutlet();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  // Fetch now, then keep asking at the rhythm of the current status (5 s while waiting for
  // the restaurant). One request at a time, so an old answer can never overwrite a newer one.
  useEffect(() => {
    let alive = true;
    let timer = null;
    setLoading(true);
    setNotFound(false);
    setOrder(null);

    const run = async () => {
      let next = 15000;
      try {
        const data = await shopApi.getOrder(publicId);
        if (!alive) return;
        setOrder(data);
        setLoadError(null);
        next = pollDelay(data.status);
      } catch (err) {
        if (!alive) return;
        if (err.status === 404) {
          setNotFound(true);
          next = null;
        } else {
          setLoadError(err); // temporary trouble: keep what we have and try again
        }
      }
      setLoading(false);
      if (alive && next) timer = setTimeout(run, next);
    };
    run();

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [publicId]);

  // One-second tick for the auto-accept countdown, only while it is on screen.
  const waiting = order?.status === 'received';
  useEffect(() => {
    if (!waiting) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [waiting]);

  if (loading) {
    return <Loader text="Retrieving your order..." fullPage />;
  }

  if (notFound || !order) {
    return (
      <div className="page-shell" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <SearchX size={44} color="var(--brand-red)" />
        <h2 style={{ color: 'var(--brand-maroon)' }}>{notFound ? 'Order not found' : 'Could not load your order'}</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          {notFound ? 'We could not find an order with this link. Check the link or open My Orders.' : loadError?.message}
        </p>
        <Link to="/" className="btn-brand-primary" style={{ marginTop: 20 }}>
          Back to Menu
        </Link>
      </div>
    );
  }

  const status = order.status;
  const rejected = status === 'rejected';
  const cancelled = status === 'cancelled';
  const failed = rejected || cancelled;
  const headline = HEADLINES[status];
  const autoAcceptMs = order.auto_accept_at ? new Date(order.auto_accept_at).getTime() - now : null;

  return (
    <div className="page-shell">
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(24px, 4vw, 40px)',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '32px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-soft) 100%)',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: failed ? 'var(--bg-soft)' : 'var(--brand-yellow)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}
        >
          {failed ? (
            <XCircle size={38} color="var(--brand-red)" strokeWidth={2.5} />
          ) : (
            <CheckCircle size={38} color="var(--brand-red)" strokeWidth={2.5} />
          )}
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: 'var(--brand-maroon)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          {rejected ? 'Order Rejected' : cancelled ? 'Order Not Accepted' : headline?.title}
        </h1>
        <p style={{ color: 'var(--brand-red)', fontWeight: 800, fontSize: '1.15rem', marginBottom: '8px' }}>
          Order reference: {order.reference}
        </p>

        {status === 'received' && (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', maxWidth: '520px', margin: '0 auto' }}>
              Order received, waiting for the restaurant to accept.
            </p>
            {autoAcceptMs !== null && (
              <p
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 10,
                  fontWeight: 800,
                  color: 'var(--brand-maroon)',
                  backgroundColor: 'var(--bg-soft)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                }}
              >
                <Clock size={16} color="var(--brand-orange)" />
                {autoAcceptMs > 0 ? `Auto-accepts in ${countdownText(autoAcceptMs)}` : 'Accepting shortly...'}
              </p>
            )}
          </>
        )}
        {headline && status !== 'received' && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', maxWidth: '520px', margin: '0 auto' }}>{headline.text}</p>
        )}
        {rejected && (
          <p style={{ color: 'var(--text-dark)', fontSize: '0.98rem', maxWidth: '520px', margin: '8px auto 0' }}>
            <strong>Reason:</strong> {order.reject_reason || 'The restaurant could not take this order.'}
          </p>
        )}
        {cancelled && (
          <p style={{ color: 'var(--text-dark)', fontSize: '0.98rem', maxWidth: '520px', margin: '8px auto 0' }}>
            We could not accept this order. You have not been charged. Please try again or call the restaurant.
          </p>
        )}

        {loadError && (
          <p style={{ marginTop: 10, color: 'var(--brand-red)', fontSize: '0.8rem', fontWeight: 700 }}>
            <AlertTriangle size={13} style={{ verticalAlign: '-2px' }} /> Connection problem, retrying. The status below may be out of date.
          </p>
        )}

        {!failed && (
          <div style={{ marginTop: '28px' }}>
            <OrderStatusStepper currentStatus={STEPPER_STEP[status] || 'Placed'} orderType="delivery" />
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          alignItems: 'flex-start',
        }}
      >
        {/* Order summary: items and the server's total */}
        <div className="receipt-paper" style={{ ...card, padding: '28px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              borderBottom: '1.5px solid var(--border-subtle)',
              paddingBottom: '12px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.18rem', color: 'var(--brand-maroon)', margin: 0 }}>Order Summary</h3>
              {order.created_at && (
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Placed {new Date(order.created_at).toLocaleDateString()}{' '}
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'var(--bg-soft)',
                color: 'var(--brand-maroon)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: 'var(--brand-maroon)',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: 6,
              }}
            >
              <span style={{ flex: 2 }}>ITEM DETAILS</span>
              <span style={{ flex: 1, textAlign: 'center' }}>QTY</span>
              <span style={{ flex: 1, textAlign: 'right' }}>AMOUNT</span>
            </div>

            {order.items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.92rem' }}>
                <div style={{ flex: 2 }}>
                  <strong style={{ color: 'var(--brand-maroon)' }}>{item.name}</strong>
                  {item.variation && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.variation}</div>}
                  {item.addons && item.addons.length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--brand-orange)' }}>+ {item.addons.map((a) => a.name).join(', ')}</div>
                  )}
                  {item.note && <div style={{ fontSize: '0.76rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>Note: {item.note}</div>}
                </div>
                <span style={{ flex: 1, textAlign: 'center', fontWeight: 700 }}>{item.qty}</span>
                <span style={{ flex: 1, textAlign: 'right', fontWeight: 800, color: 'var(--brand-maroon)' }}>{formatMoney(item.line_total)}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-soft)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              color: 'var(--brand-red)',
              fontWeight: 900,
              fontSize: '1.25rem',
            }}
          >
            <span>Total (incl. taxes & charges):</span>
            <span>{formatMoney(order.grand_total)}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>Payment: pay on delivery.</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {info?.phone && (
            <div style={card}>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Need help with this order?</div>
              <a
                href={`tel:${info.phone}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'var(--bg-soft)',
                  color: 'var(--brand-maroon)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--border-subtle)',
                }}
              >
                <Phone size={16} color="var(--brand-red)" />
                <span>
                  Call {info.name}: {info.phone}
                </span>
              </a>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/" style={{ flex: 1 }}>
              <button className="btn-brand-outline" style={{ width: '100%', padding: '12px' }}>
                Order More Items
              </button>
            </Link>
            <Link to="/orders" style={{ flex: 1 }}>
              <button className="btn-brand-primary" style={{ width: '100%', padding: '12px' }}>
                My Orders
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
