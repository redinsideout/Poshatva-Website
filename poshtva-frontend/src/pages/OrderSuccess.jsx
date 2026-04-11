import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiArrowRight } from 'react-icons/fi';

const OrderSuccess = () => {
  const { state } = useLocation();
  const orderId   = state?.orderId;

  useEffect(() => { document.title = 'Order Confirmed — Poshatva'; }, []);

  return (
    <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="card p-10 max-w-lg w-full text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle className="text-5xl text-green-500" />
        </motion.div>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-3">Order Confirmed! 🎉</h1>
        <p className="text-gray-500 mb-2">Thank you for your purchase from Poshatva!</p>
        <p className="text-gray-500 mb-6 text-sm">A confirmation email has been sent to your email address.</p>
        {orderId && (
          <div className="bg-forest-50 border border-forest-200 rounded-2xl p-4 mb-8">
            <p className="text-xs text-gray-500 mb-1">Order ID</p>
            <p className="font-mono font-bold text-forest-700 text-sm">#{orderId.slice(-8).toUpperCase()}</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          {orderId && (
            <Link to={`/orders/${orderId}`} className="btn-primary flex-1 justify-center py-3">
              <FiPackage /> Track Order
            </Link>
          )}
          <Link to="/products" className="btn-secondary flex-1 justify-center py-3">
            Continue Shopping <FiArrowRight />
          </Link>
        </div>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-5xl mt-8">🌱</motion.div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
