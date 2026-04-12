import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../utils/imageHelper';
import AuthModal from '../components/AuthModal';

const TAX_RATE = 0.05;
const FREE_SHIPPING_THRESHOLD = 499;
const SHIPPING_COST = 49;

const Cart = () => {
  const { cart, cartLoading, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const items    = cart.items || [];
  const subtotal = cart.totalAmount || 0;
  const tax      = subtotal * TAX_RATE;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total    = subtotal + tax + shipping;

  const handleCheckout = () => {
    if (!user) { setShowAuthModal(true); return; }
    navigate('/checkout', { state: { subtotal, tax, shipping, total } });
  };

  if (cartLoading) return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-forest-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (items.length === 0) return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="text-8xl mb-6">🌿</div>
        <h2 className="text-2xl font-display font-bold text-gray-700 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any products yet</p>
        <Link to="/products" className="btn-primary"><FiShoppingBag /> Start Shopping</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => navigate('/checkout', { state: { subtotal, tax, shipping, total } })}
      />

      <div className="page-container py-10">
        <h1 className="section-title mb-8">Shopping Cart <span className="text-forest-400 text-2xl">({items.length} items)</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => {
                const p = item.product;
                if (!p) return null;
                const pid    = p._id || p;
                const pname  = p.name || item.name || 'Product';
                const pslug  = p.slug;
                const imgSrc = getImageUrl(p.images?.[0]);
                return (
                  <motion.div key={item._id || pid} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="card p-5 flex gap-4">
                    {/* Image */}
                    <div className="flex-shrink-0 w-20 h-20 bg-forest-50 rounded-xl overflow-hidden">
                      {pslug
                        ? <Link to={`/products/${pslug}`}>{imgSrc ? <img src={imgSrc} alt={pname} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🌿</div>}</Link>
                        : imgSrc ? <img src={imgSrc} alt={pname} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🌿</div>
                      }
                    </div>
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      {pslug
                        ? <Link to={`/products/${pslug}`} className="font-semibold text-gray-800 hover:text-forest-600 transition-colors text-sm line-clamp-2">{pname}</Link>
                        : <p className="font-semibold text-gray-800 text-sm line-clamp-2">{pname}</p>
                      }
                      <p className="text-forest-600 font-bold mt-1">₹{item.price}</p>
                    </div>
                    {/* Quantity + Delete */}
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeFromCart(pid)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <FiTrash2 className="text-sm" />
                      </button>
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(pid, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors"><FiMinus className="text-xs" /></button>
                        <span className="px-2.5 py-1.5 text-sm font-semibold min-w-[30px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(pid, item.quantity + 1)} className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors"><FiPlus className="text-xs" /></button>
                      </div>
                      <p className="text-sm font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="font-display font-bold text-lg text-gray-800 mb-5">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400">Add ₹{(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(0)} more for free shipping</p>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base text-gray-900">
                  <span>Total</span><span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button onClick={handleCheckout}
                className="btn-primary w-full mt-6 justify-center py-3.5 text-base">
                {user ? 'Proceed to Checkout' : '🔐 Login to Checkout'} <FiArrowRight />
              </button>
              <Link to="/products" className="btn-secondary w-full mt-3 justify-center py-3 text-sm">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
