import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thank you for subscribing! Check your email for organic tips & discounts.');
    setEmail('');
  };

  return (
    <section className="section-padding bg-[#0B6B3A] text-white relative overflow-hidden">
      {/* Background soft glow blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-white/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="page-container relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lime-300 font-bold text-xs uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full border border-white/15 backdrop-blur-sm"
          >
            Weekly Green Insights
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold leading-tight"
          >
            Subscribe for Organic Gardening Tips & Offers
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-green-100 text-sm md:text-base leading-relaxed"
          >
            Get 10% discount on your first order. Learn how to grow healthy vegetables, control pests organically, and take care of your soil.
          </motion.p>
          
          <motion.form 
            onSubmit={handleSubscribe}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-3 pt-4"
          >
            <input 
              type="email" 
              required
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-5 py-4 rounded-xl text-gray-900 border border-transparent focus:outline-none focus:ring-4 focus:ring-lime-400/30 text-sm md:text-base shadow-lg"
            />
            <button 
              type="submit" 
              className="bg-lime-400 text-[#0B6B3A] font-bold px-8 py-4 rounded-xl text-sm md:text-base hover:bg-lime-300 active:scale-95 transition-all shadow-lg flex-shrink-0"
            >
              Subscribe Now
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
