import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';

const COMPARISON_ITEMS = [
  { feature: 'Premium Ingredients', brand: true, others: false },
  { feature: '100% Organic & Chemical-Free', brand: true, others: false },
  { feature: 'Lab-Tested Quality Checked', brand: true, others: 'Rarely' },
  { feature: 'Eco-Friendly Biodegradable Packaging', brand: true, others: false },
  { feature: 'Direct Support from Horticulture Experts', brand: true, others: false },
  { feature: 'Fast Delivery in 3-5 Days', brand: true, others: 'Unpredictable' },
  { feature: 'Trusted by 10,000+ Gardeners', brand: true, others: false }
];

const ComparisonSection = () => {
  return (
    <section className="section-padding bg-white">
      <div className="page-container">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#1B8D4A] font-semibold text-sm uppercase tracking-widest mb-2"
          >
            How We Stand Out
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            viewport={{ once: true }}
            className="section-title"
          >
            Why Choose Poshatva?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="section-subtitle max-w-xl mx-auto"
          >
            A side-by-side comparison of what makes us the premium choice for plant care.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-[#F8FAF8] p-4 md:p-8">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left pb-4 font-display font-semibold text-gray-400 text-xs md:text-sm tracking-wider uppercase">Features</th>
                <th className="text-center pb-4 px-4 bg-green-50 rounded-t-xl font-display font-bold text-[#0B6B3A] text-sm md:text-base tracking-wider uppercase">Poshatva</th>
                <th className="text-center pb-4 font-display font-semibold text-gray-400 text-xs md:text-sm tracking-wider uppercase">Others</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ITEMS.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                  <td className="py-4 text-sm md:text-base font-medium text-gray-700">{item.feature}</td>
                  <td className="py-4 px-4 bg-green-50/50 text-center">
                    {item.brand === true ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700">
                        <FiCheck className="text-lg stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-green-700">{item.brand}</span>
                    )}
                  </td>
                  <td className="py-4 text-center">
                    {item.others === false ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500">
                        <FiX className="text-lg stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-gray-500">{item.others}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
