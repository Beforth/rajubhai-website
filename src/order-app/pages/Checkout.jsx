import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Bike,
  Store,
  UtensilsCrossed,
  CreditCard,
  QrCode,
  Banknote,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { placeOrder } from '../services/api';
import { PriceSummary } from '../components/cart/PriceSummary';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import restaurantData from '../data/restaurant.json';

export const Checkout = () => {
  const { cartItems, orderType, setOrderType, subtotal, gst, packaging, deliveryFee, discount, grandTotal, clearCart } = useCart();
  const { user, isAuthenticated, addSavedAddress } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Form states
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [streetAddress, setStreetAddress] = useState(user?.addresses?.[0]?.line1 || '');
  const [landmark, setLandmark] = useState(user?.addresses?.[0]?.landmark || '');
  const [tableNumber, setTableNumber] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [errors, setErrors] = useState({});
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Order Success & Generated Bill State
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (cartItems.length === 0 && !confirmedOrder) {
    navigate('/');
    return null;
  }

  const totalQuantity = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);

  const quickInstructions = [
    'Extra spicy chutney',
    'Mild / Less spice',
    'No onion & garlic',
    'Pack chutneys separately',
    'Toast pav extra crisp',
  ];

  const handleAddQuickNote = (note) => {
    if (specialNotes.includes(note)) return;
    setSpecialNotes((prev) => (prev ? `${prev}, ${note}` : note));
  };

  const validate = () => {
    const errs = {};
    if (!customerName.trim()) errs.name = 'Please provide your full name';
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Valid 10-digit mobile number required';
    }

    if (orderType === 'delivery') {
      if (!streetAddress.trim()) errs.address = 'Delivery address is required';
    } else if (orderType === 'dinein') {
      if (!tableNumber.trim()) errs.tableNumber = 'Please specify table number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please complete the required details', 'error');
      return;
    }

    setLoadingOrder(true);
    try {
      const orderPayload = {
        items: cartItems.map((ci) => ({
          id: ci.id,
          name: ci.name,
          unitPrice: ci.unitPrice,
          quantity: ci.quantity,
          itemTotal: ci.itemTotal,
          selectedSize: ci.selectedSize,
          selectedAddons: ci.selectedAddons,
          instructions: ci.instructions,
        })),
        customer: {
          name: customerName,
          phone: customerPhone,
          address: orderType === 'delivery' ? { street: streetAddress, landmark } : null,
          tableNumber: orderType === 'dinein' ? tableNumber : null,
          specialNotes,
        },
        orderType,
        deliveryTiming: 'Immediate ASAP',
        payment: {
          method: paymentMethod,
          status: paymentMethod === 'cod' ? 'PENDING' : 'PAID',
          transactionId:
            paymentMethod === 'cod'
              ? null
              : `TXN-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
        },
        totals: {
          subtotal,
          gst,
          packaging,
          deliveryFee,
          discount,
          grandTotal,
        },
      };

      const placed = await placeOrder(orderPayload);

      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#FF0917', '#FFDF54', '#F67D00', '#904137'],
        });
      } catch {}

      if (isAuthenticated && orderType === 'delivery' && streetAddress) {
        addSavedAddress({ line1: streetAddress, landmark });
      }

      setConfirmedOrder(placed);
      clearCart();
      setShowSuccessModal(true);
      addToast('Order confirmed by kitchen POS!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to place order. Please try again.', 'error');
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleNavigateTracking = () => {
    setShowSuccessModal(false);
    navigate(`/order-status/${confirmedOrder.orderId}`, { state: { order: confirmedOrder } });
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
            Pick fulfillment mode, enter contact details, and complete your order.
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
              Order Summary: {totalQuantity} items • <strong style={{ color: 'var(--brand-red)' }}>₹{grandTotal}</strong>
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
              {cartItems.map((ci) => (
                <div key={ci.cartKey} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    {ci.quantity} × {ci.name} {ci.selectedSize ? `(${ci.selectedSize.name})` : ''}
                  </span>
                  <strong>₹{ci.itemTotal}</strong>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                <span>Grand Total:</span>
                <span style={{ color: 'var(--brand-red)' }}>₹{grandTotal}</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="checkout-grid">
            {/* Left Column: Form Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Step 1: Order Mode */}
              <div className="checkout-card">
                <div
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: 'var(--brand-maroon)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
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
                    }}
                  >
                    1
                  </span>
                  <span>How would you like your order?</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'delivery', label: 'Delivery', icon: Bike, time: '30-40 min' },
                    { id: 'pickup', label: 'Takeaway', icon: Store, time: '15 min' },
                    { id: 'dinein', label: 'Dine-In', icon: UtensilsCrossed, time: 'Table' },
                  ].map((mode) => {
                    const isSelected = orderType === mode.id;
                    const Icon = mode.icon;
                    return (
                      <div
                        key={mode.id}
                        onClick={() => setOrderType(mode.id)}
                        style={{
                          padding: '12px 8px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          textAlign: 'center',
                          backgroundColor: isSelected ? 'rgba(255, 9, 23, 0.05)' : 'var(--bg-card)',
                          border: isSelected ? '2px solid var(--brand-red)' : '1px solid var(--border-subtle)',
                          color: isSelected ? 'var(--brand-red)' : 'var(--brand-maroon)',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Icon size={20} color={isSelected ? 'var(--brand-red)' : 'var(--brand-orange)'} />
                        <span>{mode.label}</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: isSelected ? 'var(--brand-red)' : 'var(--text-muted)',
                          }}
                        >
                          {mode.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Contact & Address */}
              <div className="checkout-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: 'var(--brand-maroon)',
                    marginBottom: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
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
                    }}
                  >
                    2
                  </span>
                  <span>Contact & Delivery Details</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <Input
                    id="customer-name"
                    name="name"
                    autoComplete="name"
                    label="Your Name *"
                    placeholder="e.g. Ramesh Patel"
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
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    error={errors.phone}
                    icon={<span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-muted)' }}>+91</span>}
                  />
                </div>

                {orderType === 'delivery' && (
                  <>
                    <Input
                      id="delivery-address"
                      name="street-address"
                      autoComplete="street-address"
                      label="Delivery Address *"
                      placeholder="House/Flat No, Apartment, Street name, Area"
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
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                    />
                  </>
                )}

                {orderType === 'dinein' && (
                  <Input
                    id="table-number"
                    name="tableNumber"
                    label="Table Number *"
                    placeholder="e.g. Table 4"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    error={errors.tableNumber}
                    icon={<UtensilsCrossed size={16} />}
                  />
                )}

                {orderType === 'pickup' && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-soft)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.84rem',
                      color: 'var(--brand-maroon)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <Store size={16} color="var(--brand-red)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <strong>Pickup Counter:</strong> Shop No 01, Signal, near Shete Hospital, Mahatma Nagar, Nashik.
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Freshly toasted on iron tava; ready in ~15 minutes.
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--brand-maroon)',
                      marginBottom: '5px',
                      display: 'block',
                    }}
                  >
                    Cooking or Delivery Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="e.g. Extra spicy chutney, pack sev separately, call on arrival..."
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-subtle)',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-dark)',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />

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

              {/* Step 3: Payment Method */}
              <div className="checkout-card">
                <div
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: 'var(--brand-maroon)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
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
                    }}
                  >
                    3
                  </span>
                  <span>Payment Method</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    {
                      id: 'upi',
                      label: 'UPI (Google Pay, PhonePe, Paytm, BHIM)',
                      desc: 'Instant QR & UPI Intent (0% Fee)',
                      icon: QrCode,
                      recommended: true,
                    },
                    {
                      id: 'card',
                      label: 'Credit / Debit Card / NetBanking',
                      desc: 'Visa, MasterCard, RuPay',
                      icon: CreditCard,
                    },
                    {
                      id: 'cod',
                      label: orderType === 'delivery' ? 'Cash on Delivery (COD)' : 'Pay at Counter / Table',
                      desc: 'Cash or scan QR upon arrival',
                      icon: Banknote,
                    },
                  ].map((pm) => {
                    const isSelected = paymentMethod === pm.id;
                    const Icon = pm.icon;
                    return (
                      <label
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? 'rgba(255, 9, 23, 0.04)' : 'var(--bg-card)',
                          border: isSelected ? '2px solid var(--brand-red)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input
                            type="radio"
                            name="payment"
                            checked={isSelected}
                            onChange={() => setPaymentMethod(pm.id)}
                            style={{ accentColor: 'var(--brand-red)' }}
                          />
                          <Icon size={18} color={isSelected ? 'var(--brand-red)' : 'var(--brand-orange)'} />
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: 'var(--brand-maroon)', display: 'block' }}>
                              {pm.label}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {pm.desc}
                            </span>
                          </div>
                        </div>

                        {pm.recommended && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              backgroundColor: 'var(--brand-yellow)',
                              color: 'var(--brand-maroon)',
                              fontWeight: 900,
                              padding: '2px 7px',
                              borderRadius: 'var(--radius-full)',
                            }}
                          >
                            Popular
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Order Review & Bill Summary (Desktop & Mobile) */}
            <div className="checkout-summary-col">
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
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--brand-maroon)' }}>
                    Your Dishes ({totalQuantity})
                  </span>
                  <Link to="/" style={{ fontSize: '0.76rem', color: 'var(--brand-red)', fontWeight: 700 }}>
                    + Edit Dishes
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                  {cartItems.map((ci) => (
                    <div
                      key={ci.cartKey}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        fontSize: '0.84rem',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span className="veg-stamp" style={{ width: 11, height: 11 }}>
                            <span className="veg-stamp-dot" style={{ width: 5, height: 5 }} />
                          </span>
                          <strong
                            style={{
                              color: 'var(--text-dark)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {ci.quantity} × {ci.name}
                          </strong>
                        </div>
                        {ci.selectedSize && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 16 }}>
                            {ci.selectedSize.name}
                          </div>
                        )}
                        {ci.selectedAddons && ci.selectedAddons.length > 0 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--brand-orange)', marginLeft: 16 }}>
                            +{ci.selectedAddons.map((a) => a.name).join(', ')}
                          </div>
                        )}
                      </div>
                      <span style={{ fontWeight: 800, color: 'var(--brand-maroon)', flexShrink: 0 }}>
                        ₹{ci.itemTotal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <PriceSummary />

              {/* Confirm & Place Order CTA */}
              <button
                type="submit"
                disabled={loadingOrder}
                className="btn-brand-primary"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: '1rem',
                  fontWeight: 900,
                  cursor: loadingOrder ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>{loadingOrder ? 'Confirming with Kitchen...' : `Place Order • ₹${grandTotal}`}</span>
                {!loadingOrder && <ArrowRight size={18} />}
              </button>

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
                <span>100% Pure Veg • Prepared Fresh • Rajubhai Live POS</span>
              </div>
            </div>
          </div>

          {/* Sticky Mobile Bottom Bar */}
          <div className="checkout-mobile-action-bar">
            <div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-light)', fontWeight: 700, display: 'block' }}>
                Total to Pay
              </span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--brand-red)' }}>₹{grandTotal}</strong>
            </div>

            <button
              type="submit"
              disabled={loadingOrder}
              className="btn-brand-primary"
              style={{ padding: '10px 22px', fontSize: '0.88rem' }}
            >
              <span>{loadingOrder ? 'Placing...' : 'Place Order'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Order Success & Generated Order Bill Modal */}
      {showSuccessModal && confirmedOrder && (
        <Modal
          isOpen={showSuccessModal}
          onClose={handleNavigateTracking}
          title="Order Confirmed!"
          maxWidth="560px"
        >
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

              <h2 style={{ fontSize: '1.45rem', color: 'var(--brand-maroon)', margin: '0 0 4px 0', fontWeight: 900 }}>
                Order Received!
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--brand-red)', fontWeight: 800, margin: 0 }}>
                Kitchen is preparing your fresh order
              </p>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Token ID: <strong style={{ color: 'var(--brand-maroon)' }}>#{confirmedOrder.orderId}</strong>
              </p>
            </div>

            {/* Generated Bill */}
            <div
              className="receipt-paper"
              style={{
                textAlign: 'left',
                padding: '16px 18px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed var(--brand-red)',
                backgroundColor: 'var(--bg-soft)',
                fontSize: '0.86rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: 8,
                  marginBottom: 10,
                }}
              >
                <div>
                  <strong style={{ color: 'var(--brand-maroon)' }}>Rajubhai Dabeliwale</strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>FSSAI: {restaurantData.fssai}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {confirmedOrder.orderType?.toUpperCase()}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                {confirmedOrder.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      {it.quantity} × {it.name}
                    </span>
                    <strong>₹{it.itemTotal}</strong>
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 900,
                  fontSize: '1rem',
                  color: 'var(--brand-red)',
                }}
              >
                <span>Total Paid / Payable:</span>
                <span>₹{confirmedOrder.totals.grandTotal}</span>
              </div>
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