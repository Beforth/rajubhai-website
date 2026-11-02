import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const OTP_LENGTH = 4;
const RESEND_SECONDS = 30;

export const Login = () => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [step, setStep] = useState(1);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const boxRefs = useRef([]);

  const { requestOtp, loginWithOtp } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/profile';
  const otp = digits.join('');

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step === 2) boxRefs.current[0]?.focus();
  }, [step]);

  const sendOtp = async () => {
    setSendingOtp(true);
    try {
      const res = await requestOtp(phone);
      addToast(res.message, 'success');
      setCooldown(RESEND_SECONDS);
      return true;
    } catch (err) {
      addToast(err.message || 'Failed to send OTP', 'error');
      return false;
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    if (await sendOtp()) setStep(2);
  };

  const handleResend = async () => {
    if (cooldown > 0 || sendingOtp) return;
    setDigits(Array(OTP_LENGTH).fill(''));
    if (await sendOtp()) boxRefs.current[0]?.focus();
  };

  const handleDigitChange = (index, value) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) return;
    const next = [...digits];
    // A paste (or autofill) can carry several digits: spread them over the boxes.
    clean
      .slice(0, OTP_LENGTH - index)
      .split('')
      .forEach((d, i) => {
        next[index + i] = d;
      });
    setDigits(next);
    boxRefs.current[Math.min(index + clean.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key !== 'Backspace') return;
    e.preventDefault();
    const next = [...digits];
    if (next[index]) {
      next[index] = '';
      setDigits(next);
    } else if (index > 0) {
      next[index - 1] = '';
      setDigits(next);
      boxRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      addToast(`Please enter the ${OTP_LENGTH}-digit code`, 'error');
      return;
    }

    setVerifying(true);
    try {
      await loginWithOtp(phone, otp, name);
      addToast('Welcome to Annapurna’s Rajubhai Dabeliwale!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      addToast(err.message || 'Invalid OTP', 'error');
      setDigits(Array(OTP_LENGTH).fill(''));
      boxRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const changeNumber = () => {
    setStep(1);
    setDigits(Array(OTP_LENGTH).fill(''));
  };

  return (
    <div className="page-shell auth-wrap">
      <div className="auth-card">
        <img src="/logo.png" alt="" className="auth-logo" />

        {step === 1 ? (
          <form onSubmit={handleSendOtp} noValidate>
            <h1 className="auth-title">Sign in to order</h1>
            <p className="auth-sub">We’ll text a {OTP_LENGTH}-digit code to your mobile number.</p>

            <label className="auth-label" htmlFor="login-phone">
              Mobile number
            </label>
            <div className="auth-phone">
              <span className="auth-prefix">+91</span>
              <input
                id="login-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>

            <label className="auth-label" htmlFor="login-name">
              Your name <span className="auth-optional">(optional)</span>
            </label>
            <input
              id="login-name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Ramesh Patel"
              className="auth-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <button type="submit" className="btn-brand-primary auth-submit" disabled={sendingOtp}>
              <span>{sendingOtp ? 'Sending…' : 'Get OTP'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} noValidate>
            <h1 className="auth-title">Enter your code</h1>
            <p className="auth-sub">
              We sent a {OTP_LENGTH}-digit code to <strong>+91 {phone}</strong>.
            </p>

            <div className="auth-otp" role="group" aria-label={`${OTP_LENGTH}-digit code`}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    boxRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  aria-label={`Digit ${i + 1}`}
                  maxLength={OTP_LENGTH}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>

            <button type="submit" className="btn-brand-primary auth-submit" disabled={verifying}>
              <span>{verifying ? 'Verifying…' : 'Verify & continue'}</span>
              <ArrowRight size={18} />
            </button>

            <div className="auth-links">
              <button type="button" onClick={changeNumber}>
                <ArrowLeft size={14} /> Change number
              </button>
              <button type="button" onClick={handleResend} disabled={cooldown > 0 || sendingOtp}>
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        <p className="auth-demo">Demo mode: the code is 1987.</p>
        <Link to="/" className="auth-skip">
          Continue browsing the menu
        </Link>
      </div>
    </div>
  );
};
