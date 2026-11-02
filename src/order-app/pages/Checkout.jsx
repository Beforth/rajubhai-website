import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Bike,
  Store,
  UtensilsCrossed,
  CreditCard,
  QrCode,
  Banknote,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
  Phone,
  MapPin,
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
  const [deliveryTiming, setDeliveryTiming] = useState('asap');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [errors, setErrors] = useState({});

  // Requirement 9: Order Success & Generated Bill State
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (cartItems.length === 0 && !confirmedOrder) {
    navigate('/menu');
    return null;
  }

  const validate = () => {
    const errs = {};
    if (!customerName.trim()) errs.name = 'Please provide your full name';
    if (!customerPhone.trim() || customerPhone.length < 10) {
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
        deliveryTiming: deliveryTiming === 'asap' ? 'Immediate ASAP' : 'Scheduled',
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

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#E51A1B', '#FFD54F', '#F57C00', '#853A30'],
        });
      } catch (e) {}

      if (isAuthenticated && orderType === 'delivery' && streetAddress) {
        addSavedAddress({ line1: streetAddress, landmark });
      }

      // Requirement 9: Store confirmed order, clear cart, and display Success Popup & Order Bill
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
    <div className="page-shell">
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.6rem)', color: 'var(--brand-maroon)', letterSpacing: '-0.8px', marginBottom: '6px' }}>
          Checkout & Delivery
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', marginBottom: '32px' }}>
          Select fulfillment mode, verify address, and choose payment. Kitchen begins live preparation immediately.
        </p>

        <form onSubmit={handlePlaceOrder}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '36px',
              alignItems: 'flex-start',
            }}
          >
            {/* Left Column: Ordering Mode & Customer Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* 1. Dining Mode */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  border: '1.5px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--brand-maroon)', marginBottom: '16px' }}>
                  1. Order Fulfillment Mode
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { id: 'delivery', label: 'Door Delivery', icon: Bike },
                    { id: 'pickup', label: 'Takeaway Counter', icon: Store },
                    { id: 'dinein', label: 'Dine-In Table', icon: UtensilsCrossed },
                  ].map((mode) => {
                    const isSelected = orderType === mode.id;
                    const Icon = mode.icon;
                    return (
                      <div
                        key={mode.id}
                        onClick={() => setOrderType(mode.id)}
                        style={{
                          padding: '16px 12px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 10,
                          textAlign: 'center',
                          backgroundColor: isSelected ? 'var(--bg-soft)' : '#FFFFFF',
                          border: isSelected ? '2px solid var(--brand-red)' : '1px solid var(--border-subtle)',
                          color: isSelected ? 'var(--brand-red)' : 'var(--brand-maroon)',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        <Icon size={22} color={isSelected ? 'var(--brand-red)' : 'var(--brand-orange)'} />
                        <span>{mode.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Contact & Address */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  border: '1.5px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--brand-maroon)', marginBottom: '2px' }}>
                  2. Contact & Fulfillment Location
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <Input
                    label="Customer Full Name *"
                    placeholder="e.g. Ramesh Patel"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    error={errors.name}
                  />
                  <Input
                    label="Mobile Number *"
                    placeholder="10-digit mobile number"
                    type="tel"
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    error={errors.phone}
                  />
                </div>

                {orderType === 'delivery' && (
                  <>
                    <Input
                      label="Delivery Street Address *"
                      placeholder="House/Flat No, Apartment, Street, Locality"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      error={errors.address}
                    />
                    <Input
                      label="Nearby Landmark (Optional)"
                      placeholder="Near Mandvi Tower, Jubilee Ground, etc."
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                    />
                  </>
                )}

                {orderType === 'dinein' && (
                  <Input
                    label="Table Number *"
                    placeholder="e.g. Table 4"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    error={errors.tableNumber}
                  />
                )}

                {orderType === 'pickup' && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-soft)',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                      color: 'var(--brand-maroon)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <strong>Takeaway Counter:</strong> Annapurna's Rajubhai Dabeliwale, Mandvi Tower Road, Old Food Market, Bhuj.
                    Freshly toasted and packed within 15-20 minutes.
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--brand-maroon)', marginBottom: '6px', display: 'block' }}>
                    Kitchen or Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="e.g. Keep extra spicy chutney, call upon arrival..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* 3. Payment Method */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  border: '1.5px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--brand-maroon)', marginBottom: '16px' }}>
                  3. Payment Method
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { id: 'upi', label: 'UPI (GPay, PhonePe, Paytm, BHIM)', desc: 'Instant QR & UPI Intent (0% Surcharge)', icon: QrCode },
                    { id: 'card', label: 'Credit / Debit Card / NetBanking', desc: 'Visa, MasterCard, RuPay', icon: CreditCard },
                    { id: 'cod', label: orderType === 'delivery' ? 'Cash on Delivery (COD)' : 'Pay at Counter / Table', desc: 'Cash or QR scan upon arrival', icon: Banknote },
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
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? 'var(--bg-soft)' : '#FFFFFF',
                          border: isSelected ? '2px solid var(--brand-red)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <input
                            type="radio"
                            name="payment"
                            checked={isSelected}
                            onChange={() => setPaymentMethod(pm.id)}
                            style={{ accentColor: 'var(--brand-red)' }}
                          />
                          <Icon size={22} color={isSelected ? 'var(--brand-red)' : 'var(--brand-orange)'} />
                          <div>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--brand-maroon)', display: 'block' }}>
                              {pm.label}
                            </strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {pm.desc}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              backgroundColor: 'var(--brand-yellow)',
                              color: 'var(--brand-maroon)',
                              fontWeight: 900,
                              padding: '3px 10px',
                              borderRadius: 'var(--radius-full)',
                            }}
                          >
                            Selected
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Order Bill Breakdown & Confirm Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: 96 }}>
              <PriceSummary showCouponSection={false} />

              <button
                type="submit"
                disabled={loadingOrder}
                className="btn-brand-primary"
                style={{
                  width: '100%',
                  padding: '16px 28px',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  cursor: loadingOrder ? 'not-allowed' : 'pointer',
                }}
              >
                <span>Confirm & Place Order • ₹{grandTotal}</span>
                <ArrowRight size={20} />
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: '0.82rem',
                  color: 'var(--brand-maroon)',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={18} color="var(--brand-red)" />
                <span>Connected to Rajubhai Live POS Kitchen • 100% Pure Veg</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Requirement 9: Order Success & Generated Order Bill Modal */}
      {showSuccessModal && confirmedOrder && (
        <Modal
          isOpen={showSuccessModal}
          onClose={handleNavigateTracking}
          title="Order Confirmation & Bill Receipt"
          maxWidth="620px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
            {/* Success Celebration Badge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-yellow)',
                  color: 'var(--brand-maroon)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(255, 213, 79, 0.4)',
                  marginBottom: 12,
                }}
              >
                <CheckCircle size={40} color="var(--brand-red)" strokeWidth={2.5} />
              </div>

              <h2 style={{ fontSize: '1.6rem', color: 'var(--brand-maroon)', margin: '0 0 6px 0', fontWeight: 900 }}>
                Congratulations!
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--brand-red)', fontWeight: 800, margin: 0 }}>
                Your order has been placed successfully!
              </p>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Kitchen Token ID: <strong style={{ color: 'var(--brand-maroon)' }}>#{confirmedOrder.orderId}</strong>
              </p>
            </div>

            {/* Generated Order Bill (Item names, quantities, prices, total amount) */}
            <div
              className="receipt-paper"
              style={{
                textAlign: 'left',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed var(--brand-red)',
                backgroundColor: 'var(--bg-soft)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: 10,
                  marginBottom: 14,
                }}
              >
                <div>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--brand-maroon)', display: 'block' }}>
                    Annapurna's Rajubhai Dabeliwale
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    GST: 24AAAFR1987D1Z • FSSAI: {restaurantData.fssai}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block' }}>
                    Date & Time
                  </span>
                  <strong style={{ fontSize: '0.84rem', color: 'var(--brand-maroon)' }}>
                    {new Date(confirmedOrder.timestamps.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </strong>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-maroon)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 4 }}>
                  <span style={{ flex: 2 }}>ITEM</span>
                  <span style={{ flex: 1, textAlign: 'center' }}>QTY</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>PRICE</span>
                </div>

                {confirmedOrder.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-dark)' }}>
                    <div style={{ flex: 2 }}>
                      <strong>{it.name}</strong>
                      {it.selectedSize && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Size: {it.selectedSize.name}
                        </div>
                      )}
                      {it.selectedAddons && it.selectedAddons.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--brand-orange)' }}>
                          + {it.selectedAddons.map((a) => a.name).join(', ')}
                        </div>
                      )}
                    </div>
                    <span style={{ flex: 1, textAlign: 'center', fontWeight: 700 }}>
                      {it.quantity}
                    </span>
                    <span style={{ flex: 1, textAlign: 'right', fontWeight: 800, color: 'var(--brand-maroon)' }}>
                      ₹{it.itemTotal}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bill Totals Summary */}
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Item Subtotal:</span>
                  <span>₹{confirmedOrder.totals.subtotal}</span>
                </div>
                {confirmedOrder.totals.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32' }}>
                    <span>Promo Discount:</span>
                    <span>-₹{confirmedOrder.totals.discount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>5% GST:</span>
                  <span>₹{confirmedOrder.totals.gst}</span>
                </div>
                {confirmedOrder.totals.packaging > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Packaging:</span>
                    <span>₹{confirmedOrder.totals.packaging}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Delivery Service:</span>
                  <span>{confirmedOrder.totals.deliveryFee === 0 ? 'FREE' : `₹${confirmedOrder.totals.deliveryFee}`}</span>
                </div>

                <div
                  style={{
                    borderTop: '1.5px solid var(--brand-maroon)',
                    paddingTop: 8,
                    marginTop: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <strong style={{ fontSize: '1.1rem', color: 'var(--brand-maroon)' }}>
                    Total Amount Paid:
                  </strong>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--brand-red)' }}>
                    ₹{confirmedOrder.totals.grandTotal}
                  </strong>
                </div>
              </div>

              {/* Fulfillment & Delivery details if available */}
              <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px dashed var(--border-subtle)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {confirmedOrder.orderType === 'delivery' && confirmedOrder.customer?.address && (
                  <div>
                    <strong>Delivery To: </strong>
                    {confirmedOrder.customer.name} • {confirmedOrder.customer.address.street}
                    {confirmedOrder.customer.address.landmark ? ` (${confirmedOrder.customer.address.landmark})` : ''}
                  </div>
                )}
                {confirmedOrder.orderType === 'dinein' && (
                  <div>
                    <strong>Dine-In Table: </strong>
                    {confirmedOrder.customer.tableNumber}
                  </div>
                )}
                {confirmedOrder.orderType === 'pickup' && (
                  <div>
                    <strong>Takeaway Location: </strong>
                    {restaurantData.address}
                  </div>
                )}
                <div style={{ marginTop: 4 }}>
                  <strong>Payment: </strong>
                  <span style={{ textTransform: 'uppercase' }}>{confirmedOrder.payment.method}</span> • {confirmedOrder.payment.status}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={handleNavigateTracking}
                className="btn-brand-primary"
                style={{ width: '100%', padding: '14px 24px', fontSize: '1rem' }}
              >
                Track Live Order Status
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
