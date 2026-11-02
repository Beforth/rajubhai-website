import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  UtensilsCrossed,
  Printer,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { getOrderById } from '../services/api';
import { OrderStatusStepper } from '../components/common/OrderStatusStepper';
import { Loader } from '../components/common/Loader';
import restaurantData from '../data/restaurant.json';

export const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Poll status every 10s to simulate POS kitchen progression
  useEffect(() => {
    let intervalId;

    async function fetchOrder() {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
    intervalId = setInterval(fetchOrder, 10000);

    return () => clearInterval(intervalId);
  }, [orderId]);

  if (loading) {
    return <Loader text="Connecting to kitchen POS & retrieving order ticket..." fullPage />;
  }

  if (!order) {
    return (
      <div className="page-shell" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Order #{orderId} not found</h2>
        <Link to="/menu" className="btn-brand-primary" style={{ marginTop: 20 }}>
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {/* Top Banner Confirmation */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(24px, 4vw, 40px)',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '32px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #FFFFFF 0%, var(--bg-soft) 100%)',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'var(--brand-yellow)',
            color: 'var(--brand-maroon)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: '0 4px 16px rgba(255, 213, 79, 0.4)',
          }}
        >
          <CheckCircle size={38} color="var(--brand-red)" strokeWidth={2.5} />
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: 'var(--brand-maroon)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          Order Confirmed & In Kitchen!
        </h1>
        <p style={{ color: 'var(--brand-red)', fontWeight: 800, fontSize: '1.15rem', marginBottom: '8px' }}>
          POS Kitchen Token: #{order.orderId}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', maxWidth: '520px', margin: '0 auto' }}>
          Thank you, <strong>{order.customer?.name}</strong>! Annapurna's live kitchen has accepted your ticket and started tava preparation.
        </p>

        {/* Live Stepper */}
        <div style={{ marginTop: '28px' }}>
          <OrderStatusStepper currentStatus={order.status} orderType={order.orderType} />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          alignItems: 'flex-start',
        }}
      >
        {/* Requirement 9: Official Order Bill / Receipt Card */}
        <div
          className="receipt-paper"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            border: '1.5px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1.5px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.18rem', color: 'var(--brand-maroon)', margin: 0 }}>
                Official Order Bill
              </h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                FSSAI Lic: {restaurantData.fssai}
              </span>
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
              <span>Print Bill</span>
            </button>
          </div>

          {/* Itemized Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-maroon)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
              <span style={{ flex: 2 }}>ITEM DETAILS</span>
              <span style={{ flex: 1, textAlign: 'center' }}>QTY</span>
              <span style={{ flex: 1, textAlign: 'right' }}>AMOUNT</span>
            </div>

            {order.items?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.92rem',
                }}
              >
                <div style={{ flex: 2 }}>
                  <strong style={{ color: 'var(--brand-maroon)' }}>
                    {item.name}
                  </strong>
                  {item.selectedSize && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Size: {item.selectedSize.name}
                    </div>
                  )}
                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--brand-orange)' }}>
                      + {item.selectedAddons.map((a) => a.name).join(', ')}
                    </div>
                  )}
                </div>
                <span style={{ flex: 1, textAlign: 'center', fontWeight: 700 }}>
                  {item.quantity}
                </span>
                <span style={{ flex: 1, textAlign: 'right', fontWeight: 800, color: 'var(--brand-maroon)' }}>
                  ₹{item.itemTotal || item.unitPrice * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Bill Totals Summary */}
          <div
            style={{
              backgroundColor: 'var(--bg-soft)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.88rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Item Subtotal:</span>
              <span>₹{order.totals?.subtotal}</span>
            </div>
            {order.totals?.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32' }}>
                <span>Coupon Discount:</span>
                <span>-₹{order.totals.discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>5% GST:</span>
              <span>₹{order.totals?.gst}</span>
            </div>
            {order.totals?.packaging > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Packaging:</span>
                <span>₹{order.totals.packaging}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Delivery Charges:</span>
              <span>{order.totals?.deliveryFee === 0 ? 'FREE' : `₹${order.totals.deliveryFee}`}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--brand-red)',
                fontWeight: 900,
                fontSize: '1.25rem',
                borderTop: '1.5px solid var(--border-subtle)',
                paddingTop: '10px',
                marginTop: '4px',
              }}
            >
              <span>Total Bill Amount:</span>
              <span>₹{order.totals?.grandTotal}</span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-subtle)', paddingTop: 6, marginTop: 4 }}>
              Payment Mode: <strong style={{ textTransform: 'uppercase' }}>{order.payment?.method}</strong> ({order.payment?.status})
              {order.payment?.transactionId && ` • Txn: ${order.payment.transactionId}`}
            </div>
          </div>
        </div>

        {/* Fulfillment & Store Contact Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1.5px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.18rem', color: 'var(--brand-maroon)', marginBottom: '16px' }}>
              Fulfillment Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem', color: 'var(--text-dark)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <Clock size={18} color="var(--brand-orange)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Estimated Delivery / Ready:</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                    Within 25-30 minutes ({new Date(order.timestamps?.estimatedDeliveryAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </div>
                </div>
              </div>

              {order.orderType === 'delivery' && order.customer?.address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <MapPin size={18} color="var(--brand-red)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Delivering To:</strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                      {order.customer.name} • {order.customer.address.street}
                      {order.customer.address.landmark ? `, ${order.customer.address.landmark}` : ''}
                    </div>
                  </div>
                </div>
              )}

              {order.orderType === 'dinein' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <UtensilsCrossed size={18} color="var(--brand-red)" />
                  <div>
                    <strong>Dine-In Table:</strong> {order.customer?.tableNumber}
                  </div>
                </div>
              )}

              {order.orderType === 'pickup' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MapPin size={18} color="var(--brand-red)" />
                  <div>
                    <strong>Takeaway Store:</strong> {restaurantData.address}
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '20px', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Need cooking adjustments or order inquiry?
              </div>
              <a
                href={`tel:${restaurantData.contactPhone}`}
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
                <span>Call Kitchen: {restaurantData.contactPhone}</span>
              </a>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/menu" style={{ flex: 1 }}>
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
