import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const BrandStory = () => {
  return (
    <section className="section-padding bg-[#F8FAF8] overflow-hidden">
      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Image side */}
          <div className="lg:col-span-6 relative">
            <div className="absolute inset-0 bg-[#0B6B3A] rounded-3xl translate-x-3 translate-y-3 -z-10 opacity-10" />
            <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-square rounded-3xl overflow-hidden shadow-xl bg-green-800 relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=800" 
                alt="Gardening Brand Story" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
                <span className="text-lime-300 font-bold text-xs tracking-wider uppercase mb-1 block">Est. 2024</span>
                <p className="text-xl font-display font-bold">Empowering plant parents all over India.</p>
              </div>
            </div>
            {/* Decorative float badge */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 -right-4 md:right-8 bg-white p-4 rounded-2xl shadow-lg border border-gray-50 flex items-center gap-3 z-30"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-2xl">🌱</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">100% Organic</p>
                <p className="text-xs text-gray-500">Certified plant care</p>
              </div>
            </motion.div>
          </div>

          {/* Text side */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[#1B8D4A] font-semibold text-sm uppercase tracking-widest block">Our Roots</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 leading-tight">
              Rooted in Nature, Cultivated with Love
            </h2>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              Poshatva started with a simple belief: that everyone deserves to experience the therapeutic joy of green spaces. We noticed a gap in high-quality, pure organic inputs for home gardens.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div>
                <h4 className="font-display font-bold text-gray-900 text-base mb-1">Our Mission</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  To provide clean, scientifically tested organic soil conditioners, coco peat, and premium fertilizers that ensure maximum root development and plant health.
                </p>
              </div>
              <div>
                <h4 className="font-display font-bold text-gray-900 text-base mb-1">Our Vision</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  To inspire eco-friendly practices in urban settings and make sustainable organic gardening easy, rewarding, and accessible to everyone.
                </p>
              </div>
            </div>
            <div className="pt-6">
              <Link to="/products" className="btn-primary">
                Shop Our Collection <FiArrowRight />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BrandStory;
