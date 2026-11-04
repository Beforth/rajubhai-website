import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ArrowRight, ArrowLeft, ShieldCheck, CheckCircle, ChevronDown, ChevronUp, MapPin, Clock, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useOutlet } from '../context/OutletContext';
import { shopApi } from '../services/shopApi';
import { orderStore } from '../services/orderStore';
import { formatMoney } from '../services/money';
import { PriceSummary } from '../components/cart/PriceSummary';
import { CheckoutNotice } from '../components/cart/CheckoutNotice';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';

// One key per order attempt: a retry after a timeout reuses it, so the server can never
// create a second order for the same attempt. Server limit: 1-64 characters.
const newIdempotencyKey = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
};

// 10 digits after stripping spaces/dashes and a +91 prefix (same rule as the server).
const cleanPhone = (value) => {
  const digits = String(value || '').replace(/[\s\-()]/g, '');
  return digits.startsWith('+91') ? digits.slice(3) : digits;
};

const FIELD_KEYS = { name: 'name', phone: 'phone', address: 'address', landmark: 'landmark', instructions: 'instructions' };

const stepBadge = {
  width: 22,
  height: 22,
  borderRadius: '50%',
  backgroundColor: 'var(--brand-red)',
  color: 'var(--text-white)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.74rem',
  fontWeight: 900,
};
const stepTitle = {
  fontSize: '0.92rem',
  fontWeight: 800,
  color: 'var(--brand-maroon)',
  marginBottom: '2px',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

export const Checkout = () => {
  const { cartItems, requestItems, itemsSig, lineQuotes, checkout, grandTotal, itemCount, clearCart, setCartLocked, setQuoteAddress, refreshQuote } =
    useCart();
  const { user, isAuthenticated, addSavedAddress } = useAuth();
  const { addToast } = useToast();
  const { info, outletId, refreshInfo } = useOutlet();
  const navigate = useNavigate();

  // Guest form
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [streetAddress, setStreetAddress] = useState(user?.addresses?.[0]?.line1 || '');
  const [landmark, setLandmark] = useState(user?.addresses?.[0]?.landmark || '');
  const [specialNotes, setSpecialNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderLineErrors, setOrderLineErrors] = useState({}); // cartKey -> message from a 422
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Order confirmation (real reference from the server)
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const keyRef = useRef(null);
  const inFlight = useRef(false);

  // New attempt whenever the cart lines change.
  useEffect(() => {
    keyRef.current = null;
    setOrderLineErrors({});
  }, [itemsSig]);

  // The server quote follows the address, and the open/closed state is re-read on arrival.
  useEffect(() => {
    setQuoteAddress({ line: streetAddress, landmark });
  }, [streetAddress, landmark, setQuoteAddress]);
  useEffect(() => {
    refreshInfo();
  }, [refreshInfo]);

  if (cartItems.length === 0 && !confirmedOrder) {
    return <Navigate to="/" replace />;
  }

  const quickInstructions = ['Extra spicy chutney', 'Mild / Less spice', 'No onion & garlic', 'Pack chutneys separately', 'Toast pav extra crisp'];

  const handleAddQuickNote = (note) => {
    if (specialNotes.includes(note)) return;
    setSpecialNotes((prev) => (prev ? `${prev}, ${note}` : note));
  };

  const validate = () => {
    const errs = {};
    const name = customerName.trim();
    if (!name) errs.name = 'Please provide your full name';
    else if (name.length > 120) errs.name = 'Name can be at most 120 characters';
    if (!/^[0-9]{10}$/.test(cleanPhone(customerPhone))) errs.phone = 'Valid 10-digit mobile number required';
    const line = streetAddress.trim();
    if (!line) errs.address = 'Delivery address is required';
    else if (line.length > 500) errs.address = 'Address can be at most 500 characters';
    if (landmark.trim().length > 200) errs.landmark = 'Landmark can be at most 200 characters';
    if (specialNotes.trim().length > 500) errs.instructions = 'Notes can be at most 500 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOrderError = (err, submittedKeys) => {
    const status = err?.status;
    if (status === 409) {
      setFormError(err.message);
      refreshInfo();
    } else if (status === 422) {
      // The cart changed under us (item gone, rule broken, minimum): a retry needs a new attempt.
      keyRef.current = null;
      const marks = {};
      (Array.isArray(err.errors?.items) ? err.errors.items : []).forEach((e) => {
        const key = submittedKeys[e.index];
        if (key) marks[key] = e.message;
      });
      setOrderLineErrors(marks);
      setFormError(`${err.message}. Update your cart from the menu, or try again.`);
      refreshQuote();
    } else if (status === 400) {
      const fieldErrors = {};
      Object.entries(err.errors && typeof err.errors === 'object' ? err.errors : {}).forEach(([k, v]) => {
        if (FIELD_KEYS[k]) fieldErrors[FIELD_KEYS[k]] = Array.isArray(v) ? v.join(' ') : String(v);
      });
      if (Object.keys(fieldErrors).length) setErrors((prev) => ({ ...prev, ...fieldErrors }));
      else setFormError(err.message);
    } else if (status === 429) {
      setFormError('Too many attempts, please wait a minute and try again.');
    } else {
      // Network failure, timeout or an unexpected reply: the cart and the attempt key are kept.
      setFormError(err?.message || 'Could not place the order. Please try again.');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (inFlight.current) return;
    if (!checkout.canCheckout) {
      // W3: never ignore the press silently while the total is being recalculated.
      if (checkout.pending) setFormError('Updating your total… please press Place Order again in a moment.');
      return;
    }
    setFormError('');
    if (!validate()) {
      addToast('Please complete the required details', 'error');
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    setCartLocked(true);
    const submittedKeys = cartItems.map((ci) => ci.cartKey);
    if (!keyRef.current) keyRef.current = newIdempotencyKey();
    try {
      const placed = await shopApi.placeOrder(outletId, {
        idempotency_key: keyRef.current,
        customer: { name: customerName.trim(), phone: cleanPhone(customerPhone) },
        address: { line: streetAddress.trim(), landmark: landmark.trim() },
        instructions: specialNotes.trim(),
        items: requestItems,
      });

      orderStore.add(placed.public_id, placed.reference);
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#FF0917', '#FFDF54', '#F67D00', '#904137'],
        });
      } catch {
        /* decoration only */
      }
      if (isAuthenticated && streetAddress) addSavedAddress({ line1: streetAddress, landmark });

      setConfirmedOrder(placed);
      clearCart();
      setShowSuccessModal(true);
    } catch (err) {
      handleOrderError(err, submittedKeys);
    } finally {
      inFlight.current = false;
      setSubmitting(false);
      setCartLocked(false);
    }
  };

  const handleNavigateTracking = () => {
    setShowSuccessModal(false);
    navigate(`/order-status/${confirmedOrder.public_id}`);
  };

  const placeDisabled = submitting || !checkout.canCheckout;

  const lineInfo = (ci) => {
    const q = lineQuotes[ci.cartKey];
    return { total: q && q.qty === ci.quantity && !q.error ? q.line_total : null, error: orderLineErrors[ci.cartKey] || q?.error || '' };
  };

  return (
    <div className="page-shell checkout-page">
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '16px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.84rem',
              fontWeight: 700,
              color: 'var(--brand-maroon)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-soft)',
              border: '1px solid var(--border-subtle)',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Menu (Add dishes)</span>
          </Link>
        </div>

        {/* Header Title */}
        <div style={{ marginBottom: '20px' }}>
          <h1
            style={{
              fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)',
              color: 'var(--brand-maroon)',
              letterSpacing: '-0.5px',
              margin: '0 0 4px 0',
            }}
          >
            Order Details & Checkout
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
            Delivery only. Enter your contact details and place your order.
          </p>
        </div>

        {/* Mobile Collapsible Order Summary */}
        <div className="checkout-mobile-summary">
          <button
            type="button"
            onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-card)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 750,
              fontSize: '0.88rem',
              color: 'var(--brand-maroon)',
              cursor: 'pointer',
              marginBottom: mobileSummaryOpen ? 10 : 16,
            }}
          >
            <span>
              Order Summary: {itemCount} items •{' '}
              <strong style={{ color: 'var(--brand-red)' }}>{grandTotal ? formatMoney(grandTotal) : '…'}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-red)', fontSize: '0.8rem' }}>
              {mobileSummaryOpen ? 'Hide' : 'View'}
              {mobileSummaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>

          {mobileSummaryOpen && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.84rem',
              }}
            >
              {cartItems.map((ci) => {
                const li = lineInfo(ci);
                return (
                  <div key={ci.cartKey} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      {ci.quantity} × {ci.name} {ci.selectedSize ? `(${ci.selectedSize.name})` : ''}
                    </span>
                    <strong>{li.total ? formatMoney(li.total) : '…'}</strong>
                  </div>
                );
              })}
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 8,
                  marginTop: 4,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                }}
              >
                <span>Grand Total:</span>
                <span style={{ color: 'var(--brand-red)' }}>{grandTotal ? formatMoney(grandTotal) : '…'}</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handlePlaceOrder} noValidate>
          <div className="checkout-grid">
            {/* Left Column: Form Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Step 1: Contact & Address (Takeaway and Dine-In are off: delivery only) */}
              <div className="checkout-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={stepTitle}>
                  <span style={stepBadge}>1</span>
                  <span>Contact & Delivery Details</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <Input
                    id="customer-name"
                    name="name"
                    autoComplete="name"
                    label="Your Name *"
                    placeholder="e.g. Ramesh Patel"
                    maxLength={120}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    error={errors.name}
                  />
                  <Input
                    id="customer-phone"
                    name="tel"
                    autoComplete="tel"
                    label="Phone Number *"
                    placeholder="10-digit mobile number"
                    type="tel"
                    maxLength={16}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/[^\d+\s]/g, ''))}
                    error={errors.phone}
                    icon={<span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-muted)' }}>+91</span>}
                  />
                </div>

                <Input
                  id="delivery-address"
                  name="street-address"
                  autoComplete="street-address"
                  label="Delivery Address *"
                  placeholder="House/Flat No, Apartment, Street name, Area"
                  maxLength={500}
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  error={errors.address}
                  icon={<MapPin size={16} />}
                />
                <Input
                  id="delivery-landmark"
                  name="landmark"
                  label="Nearby Landmark (Optional)"
                  placeholder="e.g. Near Mahatma Nagar Ground / Signal"
                  maxLength={200}
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  error={errors.landmark}
                />

                <div>
                  <label
                    htmlFor="order-notes"
                    style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-maroon)', marginBottom: '5px', display: 'block' }}
                  >
                    Cooking or Delivery Notes (Optional)
                  </label>
                  <textarea
                    id="order-notes"
                    rows={2}
                    maxLength={500}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="e.g. Extra spicy chutney, pack sev separately, call on arrival..."
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: errors.instructions ? '1.5px solid var(--brand-red)' : '1.5px solid var(--border-subtle)',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-dark)',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                  {errors.instructions && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--brand-red)', fontWeight: 600 }}>{errors.instructions}</span>
                  )}

                  {/* Quick Note Suggestions */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
                    {quickInstructions.map((note) => (
                      <button
                        key={note}
                        type="button"
                        onClick={() => handleAddQuickNote(note)}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: 'var(--brand-maroon)',
                          backgroundColor: 'var(--bg-soft)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-full)',
                          padding: '3px 8px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        + {note}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2: Payment (online payment is not built yet) */}
              <div className="checkout-card">
                <div style={{ ...stepTitle, marginBottom: 10 }}>
                  <span style={stepBadge}>2</span>
                  <span>Payment</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: 'var(--brand-maroon)' }}>
                  <Banknote size={18} color="var(--brand-orange)" />
                  <span>
                    <strong>Pay on delivery.</strong> Online payment is not available yet.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Order Review & Bill Summary (Desktop & Mobile) */}
            <div className="checkout-summary-col">
              {info && (
                <div className="checkout-card" style={{ padding: '14px 18px', fontSize: '0.84rem', color: 'var(--brand-maroon)' }}>
                  <strong>{info.name}</strong>
                  {info.address && <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{info.address}</div>}
                  {info.preparation_minutes > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      <Clock size={13} color="var(--brand-orange)" />
                      <span>Preparation time about {info.preparation_minutes} min</span>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items Review Box */}
              <div className="checkout-card" style={{ padding: '16px 18px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '8px',
                    marginBottom: '10px',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--brand-maroon)' }}>Your Dishes ({itemCount})</span>
                  <Link to="/" style={{ fontSize: '0.76rem', color: 'var(--brand-red)', fontWeight: 700 }}>
                    + Edit Dishes
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                  {cartItems.map((ci) => {
                    const li = lineInfo(ci);
                    return (
                      <div key={ci.cartKey} style={{ fontSize: '0.84rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span className="veg-stamp" style={{ width: 11, height: 11 }}>
                                <span className="veg-stamp-dot" style={{ width: 5, height: 5 }} />
                              </span>
                              <strong
                                style={{ color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                              >
                                {ci.quantity} × {ci.name}
                              </strong>
                            </div>
                            {ci.selectedSize && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 16 }}>{ci.selectedSize.name}</div>
                            )}
                            {ci.selectedAddons && ci.selectedAddons.length > 0 && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--brand-orange)', marginLeft: 16 }}>
                                +{ci.selectedAddons.map((a) => a.name).join(', ')}
                              </div>
                            )}
                          </div>
                          <span style={{ fontWeight: 800, color: 'var(--brand-maroon)', flexShrink: 0 }}>
                            {li.total ? formatMoney(li.total) : li.error ? '' : '…'}
                          </span>
                        </div>
                        {li.error && (
                          <div role="alert" style={{ color: 'var(--brand-red)', fontSize: '0.76rem', fontWeight: 700, marginLeft: 16 }}>
                            {li.error}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Breakdown: the server quote */}
              <PriceSummary />

              {/* Confirm & Place Order CTA */}
              <div>
                <button
                  type="submit"
                  disabled={placeDisabled}
                  className="btn-brand-primary"
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    fontSize: '1rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <span>{submitting ? 'Placing your order...' : grandTotal ? `Place Order • ${formatMoney(grandTotal)}` : 'Place Order'}</span>
                  {!submitting && <ArrowRight size={18} />}
                </button>
                <CheckoutNotice />
                {formError && (
                  <div
                    role="alert"
                    style={{
                      marginTop: 10,
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-soft)',
                      border: '1px solid var(--brand-red)',
                      color: 'var(--brand-red)',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                    }}
                  >
                    {formError}
                    {Object.keys(orderLineErrors).length > 0 && (
                      <div style={{ marginTop: 6 }}>
                        <Link to="/" style={{ textDecoration: 'underline', color: 'var(--brand-maroon)' }}>
                          Back to the menu
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Assurance Marks */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={15} color="var(--brand-red)" />
                <span>100% Pure Veg • Prepared Fresh</span>
              </div>
            </div>
          </div>

          {/* Sticky Mobile Bottom Bar */}
          <div className="checkout-mobile-action-bar">
            <div>
              <span
                style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  color: 'var(--text-light)',
                  fontWeight: 700,
                  display: 'block',
                }}
              >
                Total to Pay
              </span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--brand-red)' }}>{grandTotal ? formatMoney(grandTotal) : '…'}</strong>
            </div>

            <button type="submit" disabled={placeDisabled} className="btn-brand-primary" style={{ padding: '10px 22px', fontSize: '0.88rem' }}>
              <span>{submitting ? 'Placing...' : 'Place Order'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Order confirmation: the real reference from the server */}
      {showSuccessModal && confirmedOrder && (
        <Modal isOpen={showSuccessModal} onClose={handleNavigateTracking} title="Order Placed!" maxWidth="520px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-yellow)',
                  color: 'var(--brand-maroon)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(255, 223, 84, 0.4)',
                  marginBottom: 10,
                }}
              >
                <CheckCircle size={36} color="var(--brand-red)" strokeWidth={2.5} />
              </div>

              <h2 style={{ fontSize: '1.45rem', color: 'var(--brand-maroon)', margin: '0 0 4px 0', fontWeight: 900 }}>Order Received!</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--brand-red)', fontWeight: 800, margin: 0 }}>
                Waiting for the restaurant to accept
              </p>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Order reference: <strong style={{ color: 'var(--brand-maroon)' }}>{confirmedOrder.reference}</strong>
              </p>
            </div>

            <div
              style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed var(--brand-red)',
                backgroundColor: 'var(--bg-soft)',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 900,
                fontSize: '1rem',
                color: 'var(--brand-red)',
              }}
            >
              <span>Total payable:</span>
              <span>{formatMoney(confirmedOrder.grand_total)}</span>
            </div>

            <button
              type="button"
              className="btn-brand-primary"
              onClick={handleNavigateTracking}
              style={{ width: '100%', padding: '14px 20px', fontSize: '0.95rem' }}
            >
              <span>Track Live Order Status</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </Modal>
      )}

      <style>{`
        .checkout-mobile-summary { display: block; }
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .checkout-card {
          background-color: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: 18px;
          border: 1.5px solid var(--border-subtle);
          box-shadow: var(--shadow-sm);
        }
        .checkout-summary-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .checkout-mobile-action-bar {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 850;
          background: var(--bg-card);
          border-top: 1.5px solid var(--border-subtle);
          padding: 12px 20px;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 -4px 18px rgba(43, 23, 18, 0.1);
        }
        .checkout-page {
          padding-bottom: 90px;
        }

        @media (min-width: 960px) {
          .checkout-mobile-summary { display: none !important; }
          .checkout-mobile-action-bar { display: none !important; }
          .checkout-page { padding-bottom: 32px !important; }
          .checkout-grid {
            grid-template-columns: minmax(0, 1fr) 360px !important;
            gap: 28px !important;
            align-items: flex-start !important;
          }
          .checkout-card {
            padding: 22px !important;
          }
          .checkout-summary-col {
            position: sticky !important;
            top: 84px !important;
          }
        }
      `}</style>
    </div>
  );
};
