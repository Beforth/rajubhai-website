import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { StickyMobileCartBar } from './components/cart/StickyMobileCartBar';

// Pages
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { CartPage } from './pages/CartPage';
import { Checkout } from './pages/Checkout';
import { OrderTracking } from './pages/OrderTracking';
import { Login } from './pages/Login';
import { OrdersProfile } from './pages/OrdersProfile';

export function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-status/:orderId" element={<OrderTracking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/orders" element={<OrdersProfile />} />
          <Route path="/profile" element={<OrdersProfile />} />
        </Routes>
      </main>

      {/* Global Slide-In Cart Drawer */}
      <CartDrawer />

      {/* Mobile Sticky Order Bar */}
      <StickyMobileCartBar />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
