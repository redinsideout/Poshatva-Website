import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiTruck, FiHeadphones, FiAward } from 'react-icons/fi';

const TRUST = [
  {
    icon: FiAward,
    title: 'Premium Quality',
    desc: 'Lab-tested, certified organic products with guaranteed freshness.',
    color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500',
    iconColor: 'text-amber-600 group-hover:text-white',
  },
  {
    icon: FiTruck,
    title: 'Fast Delivery',
    desc: 'Free shipping on all orders. Delivered within 3–5 business days.',
    color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-500',
    iconColor: 'text-blue-600 group-hover:text-white',
  },
  {
    icon: FiShield,
    title: 'Secure Payments',
    desc: '100% safe checkout with Razorpay. UPI, cards & wallets accepted.',
    color: 'bg-green-50 text-green-600 group-hover:bg-[#1B8D4A]',
    iconColor: 'text-green-600 group-hover:text-white',
  },
  {
    icon: FiHeadphones,
    title: 'Expert Support',
    desc: 'Get personalised gardening advice from our horticulture experts.',
    color: 'bg-purple-50 text-purple-600 group-hover:bg-purple-500',
    iconColor: 'text-purple-600 group-hover:text-white',
  },
];

const TrustBar = () => (
  <section className="py-12 bg-white border-b border-gray-100">
    <div className="page-container">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {TRUST.map((t, i) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            viewport={{ once: true }}
            className="group flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 md:p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 cursor-default"
          >
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${t.color}`}>
              <t.icon className={`text-xl transition-colors duration-300 ${t.iconColor}`} />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-display font-bold text-gray-900 text-sm md:text-base mb-1">{t.title}</h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{t.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBar;
