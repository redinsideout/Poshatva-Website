import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { name: 'Plants',          slug: 'plants',           emoji: '🪴', gradient: 'from-green-100 to-emerald-200',   ring: 'ring-green-300'  },
  { name: 'Seeds',           slug: 'seeds',            emoji: '🌾', gradient: 'from-yellow-100 to-amber-200',    ring: 'ring-amber-300'  },
  { name: 'Potting Mix',     slug: 'potting-mix',      emoji: '🌱', gradient: 'from-lime-100 to-green-200',      ring: 'ring-lime-300'   },
  { name: 'Soil',            slug: 'soil',             emoji: '🟫', gradient: 'from-amber-100 to-orange-200',    ring: 'ring-orange-300' },
  { name: 'Fertilizers',     slug: 'fertilizers',      emoji: '💧', gradient: 'from-blue-100 to-cyan-200',       ring: 'ring-blue-300'   },
  { name: 'Cocopeat',        slug: 'cocopeat',         emoji: '🥥', gradient: 'from-orange-100 to-amber-200',    ring: 'ring-orange-300' },
  { name: 'Vermicompost',    slug: 'vermicompost',     emoji: '🪱', gradient: 'from-teal-100 to-green-200',      ring: 'ring-teal-300'   },
  { name: 'Garden Tools',    slug: 'garden-tools',     emoji: '🛠️', gradient: 'from-gray-100 to-slate-200',     ring: 'ring-gray-300'   },
  { name: 'Pots & Planters', slug: 'pots-planters',    emoji: '🪣', gradient: 'from-rose-100 to-pink-200',       ring: 'ring-rose-300'   },
  { name: 'Plant Care',      slug: 'plant-care',       emoji: '🌿', gradient: 'from-emerald-100 to-teal-200',    ring: 'ring-emerald-300'},
  { name: 'Organic',         slug: 'organic-products', emoji: '🌻', gradient: 'from-yellow-100 to-lime-200',     ring: 'ring-yellow-300' },
  { name: 'Combos',          slug: 'combos',           emoji: '🎁', gradient: 'from-purple-100 to-violet-200',   ring: 'ring-purple-300' },
];

const CategoryGrid = () => (
  <section className="section-padding bg-[#F8FAF8]">
    <div className="page-container">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.p
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-[#1B8D4A] font-semibold text-sm uppercase tracking-widest mb-2"
        >
          Browse Collections
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} viewport={{ once: true }}
          className="section-title"
        >
          Shop By Category
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}
          className="section-subtitle max-w-xl mx-auto"
        >
          Everything your plants need, all in one place
        </motion.p>
      </div>

      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 200 }}
            viewport={{ once: true }}
          >
            <Link
              to={`/products?search=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-3 group"
            >
              <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${cat.gradient}
                ring-2 ${cat.ring} ring-offset-2 shadow-md
                flex items-center justify-center text-4xl md:text-5xl
                group-hover:scale-110 group-hover:shadow-xl
                transition-all duration-300`}
              >
                {cat.emoji}
              </div>
              <span className="text-xs md:text-sm font-semibold text-gray-700 group-hover:text-[#0B6B3A] transition-colors text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Mobile horizontal scroll */}
      <div className="sm:hidden flex gap-5 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            viewport={{ once: true }}
            className="flex-shrink-0"
          >
            <Link to={`/products?search=${encodeURIComponent(cat.name)}`} className="flex flex-col items-center gap-2">
              <div className={`w-18 h-18 w-[72px] h-[72px] rounded-full bg-gradient-to-br ${cat.gradient}
                ring-2 ${cat.ring} ring-offset-1 shadow-md
                flex items-center justify-center text-3xl
                active:scale-95 transition-transform`}
              >
                {cat.emoji}
              </div>
              <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight w-16">{cat.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CategoryGrid;
