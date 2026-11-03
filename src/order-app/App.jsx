import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { CartDrawer } from './components/cart/CartDrawer';
import { StickyMobileCartBar } from './components/cart/StickyMobileCartBar';

// Pages
import { OrderHome } from './pages/OrderHome';
import { CartPage } from './pages/CartPage';
import { Checkout } from './pages/Checkout';
import { OrderTracking } from './pages/OrderTracking';
import { Login } from './pages/Login';
import { OrdersProfile } from './pages/OrdersProfile';

// The old /menu page is now the order home; keep ?category= links working.
const MenuRedirect = () => <Navigate to={{ pathname: '/', search: useLocation().search }} replace />;

export function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<OrderHome />} />
          <Route path="/menu" element={<MenuRedirect />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-status/:orderId" element={<OrderTracking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/orders" element={<OrdersProfile />} />
          <Route path="/profile" element={<OrdersProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Slide-In Cart Drawer */}
      <CartDrawer />

      {/* Mobile Sticky Order Bar */}
      <StickyMobileCartBar />
    </div>
  );
}

export default App;
