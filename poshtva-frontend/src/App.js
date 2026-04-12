import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home          from './pages/Home';
import Products      from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import OrderSuccess  from './pages/OrderSuccess';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Profile       from './pages/Profile';
import OrderDetail   from './pages/OrderDetail';
import NotFound      from './pages/NotFound';

// Admin Pages
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminProducts    from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders      from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminUsers       from './pages/admin/AdminUsers';

const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
              success: { iconTheme: { primary: '#2d6a4f', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/"          element={<MainLayout><Home /></MainLayout>}          />
            <Route path="/products"  element={<MainLayout><Products /></MainLayout>}      />
            <Route path="/products/:slug" element={<MainLayout><ProductDetail /></MainLayout>} />
            <Route path="/cart"      element={<MainLayout><Cart /></MainLayout>}    />
            <Route path="/login"     element={<Login />}      />
            <Route path="/register"  element={<Register />}   />
            <Route path="/checkout" element={<ProtectedRoute><MainLayout><Checkout /></MainLayout></ProtectedRoute>} />
            <Route path="/order-success" element={<ProtectedRoute><MainLayout><OrderSuccess /></MainLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><MainLayout><OrderDetail /></MainLayout></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products"  element={<AdminRoute><AdminProducts /></AdminRoute>}  />
            <Route path="/admin/products/new"       element={<AdminRoute><AdminProductForm /></AdminRoute>} />
            <Route path="/admin/products/:id/edit"  element={<AdminRoute><AdminProductForm /></AdminRoute>} />
            <Route path="/admin/orders"    element={<AdminRoute><AdminOrders /></AdminRoute>}    />
            <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetail /></AdminRoute>} />
            <Route path="/admin/users"     element={<AdminRoute><AdminUsers /></AdminRoute>}     />

            {/* 404 */}
            <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
