import React from 'react';
import { Check, Clock, ChefHat, PackageCheck, Bike, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { key: 'Placed', label: 'Order Placed', icon: Clock },
  { key: 'Accepted', label: 'Accepted', icon: Check },
  { key: 'Preparing', label: 'Preparing', icon: ChefHat },
  { key: 'Ready', label: 'Ready', icon: PackageCheck },
  { key: 'Out for delivery', label: 'Out for Delivery', icon: Bike },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
];

export const OrderStatusStepper = ({ currentStatus = 'Placed', orderType = 'delivery' }) => {
  // Filter steps based on order type (Pickup & Dinein skip 'Out for delivery')
  const steps = STEPS.filter((step) => {
    if ((orderType === 'pickup' || orderType === 'dinein') && step.key === 'Out for delivery') {
      return false;
    }
    return true;
  });

  const currentIndex = steps.findIndex(
    (s) => s.key.toLowerCase() === (currentStatus || '').toLowerCase()
  );
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        {/* Progress background line */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            height: '4px',
            backgroundColor: 'var(--peach)',
            zIndex: 1,
          }}
        />

        {/* Completed Progress fill line */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: `${(activeIndex / (steps.length - 1)) * 90}%`,
            height: '4px',
            backgroundColor: 'var(--red)',
            zIndex: 2,
            transition: 'width 0.4s ease',
          }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const IconComponent = step.icon;

          return (
            <div
              key={step.key}
              style={{
                position: 'relative',
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCurrent
                    ? 'var(--red)'
                    : isDone
                    ? 'var(--orange)'
                    : '#FFFFFF',
                  color: isCurrent || isDone ? 'var(--white)' : 'var(--brown)',
                  border: isCurrent || isDone ? 'none' : '2px solid var(--peach)',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(255, 9, 23, 0.2)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                <IconComponent size={20} strokeWidth={isCurrent ? 2.5 : 2} />
              </div>

              <span
                style={{
                  marginTop: '10px',
                  fontSize: '0.78rem',
                  fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
                  color: isCurrent ? 'var(--red)' : isDone ? 'var(--brown)' : 'var(--text-muted)',
                  textAlign: 'center',
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
