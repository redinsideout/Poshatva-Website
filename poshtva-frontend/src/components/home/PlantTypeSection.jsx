import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TYPES = [
  { label: 'Indoor Plants',  emoji: '🪴', color: 'from-green-50 to-emerald-100',   border: 'hover:border-green-400'  },
  { label: 'Outdoor Plants', emoji: '🌳', color: 'from-teal-50 to-teal-100',        border: 'hover:border-teal-400'   },
  { label: 'Succulents',     emoji: '🌵', color: 'from-lime-50 to-lime-100',        border: 'hover:border-lime-400'   },
  { label: 'Flower Plants',  emoji: '🌸', color: 'from-rose-50 to-pink-100',        border: 'hover:border-rose-400'   },
  { label: 'Vegetables',     emoji: '🥦', color: 'from-emerald-50 to-green-100',    border: 'hover:border-emerald-400'},
  { label: 'Herbs',          emoji: '🌿', color: 'from-green-50 to-teal-100',       border: 'hover:border-green-400'  },
  { label: 'Fruit Plants',   emoji: '🍋', color: 'from-yellow-50 to-amber-100',     border: 'hover:border-amber-400'  },
];

const PlantTypeSection = () => (
  <section className="section-padding bg-[#F8FAF8]">
    <div className="page-container">
      <div className="text-center mb-12">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-[#1B8D4A] font-semibold text-sm uppercase tracking-widest mb-2">
          Find Your Plant
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} viewport={{ once: true }}
          className="section-title">
          Shop by Plant Type
        </motion.h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {TYPES.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
          >
            <Link
              to={`/products?search=${encodeURIComponent(t.label)}`}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-transparent ${t.border}
                bg-gradient-to-br ${t.color} transition-all duration-300 shadow-sm hover:shadow-md group`}
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{t.emoji}</span>
              <span className="text-xs md:text-sm font-semibold text-gray-800 text-center leading-tight">{t.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PlantTypeSection;
