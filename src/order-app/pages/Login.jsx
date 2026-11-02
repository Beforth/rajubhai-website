import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Phone, Lock, User, ArrowRight, Sparkles, ShieldCheck, Heart, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';

export const Login = () => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const { requestOtp, loginWithOtp } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/profile';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await requestOtp(phone);
      addToast(res.message, 'success');
      setStep(2);
    } catch (err) {
      addToast(err.message || 'Failed to send OTP', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      addToast('Please enter the OTP', 'error');
      return;
    }

    setVerifying(true);
    try {
      await loginWithOtp(phone, otp, name);
      addToast('Welcome to Annapurna’s Rajubhai Dabeliwale!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      addToast(err.message || 'Invalid OTP', 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="page-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 50px rgba(133, 58, 48, 0.12)',
          border: '1.5px solid var(--border-subtle)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        }}
      >
        {/* Left Side: Aesthetic Brand Card with Street-Food Story & Images */}
        <div
          style={{
            background: 'linear-gradient(145deg, var(--bg-maroon-dark) 0%, #4D1A14 100%)',
            color: '#FFFFFF',
            padding: 'clamp(32px, 5vw, 48px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Decorative Backdrop Elements */}
          <div
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 213, 79, 0.08)',
              pointerEvents: 'none',
            }}
          />

          <div>
            {/* Circular Logo from public folder */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <img
                src="/logo.png"
                alt="Annapurna's Rajubhai Dabeliwale Logo"
                style={{
                  width: 54,
                  height: 54,
                  objectFit: 'contain',
                  flexShrink: 0,
                }}
              />
              <div>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', margin: 0, fontWeight: 900 }}>
                  Annapurna’s Rajubhai
                </h3>
                <span style={{ color: 'var(--brand-yellow)', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Taste The Real • Since 1987
                </span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.8rem', color: '#FFFFFF', lineHeight: 1.25, marginBottom: 14, fontWeight: 900 }}>
              Taste 39+ Years of Culinary Heritage.
            </h2>
            <p style={{ color: 'var(--brand-peach)', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: 24 }}>
              Login to experience lightning-fast KOT ordering, repeat your favorite Dabeli combos with 1 click, and track live kitchen preparation.
            </p>

            {/* Visual Mini Showcase */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                border: '1px solid rgba(255, 216, 180, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=200&q=80"
                alt="Original Rajubhai Dabeli"
                style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
              />
              <div>
                <strong style={{ color: 'var(--brand-yellow)', fontSize: '0.92rem', display: 'block' }}>
                  Original Special Dabeli
                </strong>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem' }}>
                  Pure Amul butter • 16 Secret Spices
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Row */}
          <div style={{ display: 'flex', gap: 16, marginTop: 32, fontSize: '0.82rem', color: 'var(--brand-peach)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={16} color="var(--brand-yellow)" />
              <span>100% Pure Veg</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={16} color="var(--brand-yellow)" />
              <span>4.9★ Rating</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Modern Form */}
        <div style={{ padding: 'clamp(32px, 5vw, 48px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--brand-red)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Customer Portal
            </span>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--brand-maroon)', marginTop: 4, marginBottom: 6, fontWeight: 900 }}>
              {step === 1 ? 'Welcome Back!' : 'Verify Mobile OTP'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
              {step === 1
                ? 'Enter your mobile number to sign in or create an account.'
                : `We sent a 4-digit code to +91 ${phone}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <Input
                label="Your Full Name (Optional)"
                placeholder="e.g. Ramesh Patel"
                icon={<User size={18} />}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                label="Mobile Number *"
                placeholder="10-digit mobile number"
                type="tel"
                maxLength={10}
                icon={<Phone size={18} />}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                required
              />

              {/* Demo Hint Banner */}
              <div
                style={{
                  backgroundColor: 'var(--bg-soft)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.84rem',
                  color: 'var(--brand-maroon)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Sparkles size={18} color="var(--brand-red)" />
                <span>
                  Demo Instant OTP: <strong style={{ color: 'var(--brand-red)' }}>1987</strong> (Our founding year!)
                </span>
              </div>

              <button
                type="submit"
                disabled={sendingOtp}
                className="btn-brand-primary"
                style={{ width: '100%', padding: '15px', fontSize: '1.02rem', marginTop: 4 }}
              >
                <span>{sendingOtp ? 'Sending OTP...' : 'Get OTP Code'}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <Input
                label="Enter 4-Digit OTP *"
                placeholder="e.g. 1987"
                maxLength={4}
                icon={<Lock size={18} />}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ fontSize: '0.86rem', color: 'var(--brand-maroon)', fontWeight: 700 }}
                >
                  Change Mobile
                </button>
                <button
                  type="button"
                  onClick={() => addToast('Resent demo OTP: 1987', 'info')}
                  style={{ fontSize: '0.86rem', color: 'var(--brand-red)', fontWeight: 800 }}
                >
                  Resend OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="btn-brand-primary"
                style={{ width: '100%', padding: '15px', fontSize: '1.02rem', marginTop: 4 }}
              >
                <span>{verifying ? 'Verifying...' : 'Verify & Continue'}</span>
              </button>
            </form>
          )}

          {/* Guest Continue Link */}
          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              marginTop: '28px',
              paddingTop: '20px',
              textAlign: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => navigate('/menu')}
              style={{
                color: 'var(--brand-maroon)',
                fontSize: '0.92rem',
                fontWeight: 800,
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Continue as Guest without login →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
