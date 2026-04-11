import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => (
  <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <div className="text-9xl font-display font-bold text-forest-100 mb-4">404</div>
      <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl mb-6">🌿</motion.div>
      <h1 className="text-3xl font-display font-bold text-gray-800 mb-3">Page Not Found</h1>
      <p className="text-gray-500 mb-8">Looks like this page got lost in the garden</p>
      <Link to="/" className="btn-primary text-base py-3 px-8">Back to Home</Link>
    </motion.div>
  </div>
);

export default NotFound;
