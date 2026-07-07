import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from '../ProductCard';

const BestSellers = ({ products = [] }) => {
  if (!products.length) return null;

  return (
    <section className="section-padding bg-white">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-[#1B8D4A] font-semibold text-sm uppercase tracking-widest mb-2"
            >
              Customer Favourites
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} viewport={{ once: true }}
              className="section-title"
            >
              Best Sellers
            </motion.h2>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button id="bs-prev" className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-[#1B8D4A] flex items-center justify-center text-gray-500 hover:text-[#0B6B3A] transition-all">
              <FiChevronLeft />
            </button>
            <button id="bs-next" className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-[#1B8D4A] flex items-center justify-center text-gray-500 hover:text-[#0B6B3A] transition-all">
              <FiChevronRight />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={{ prevEl: '#bs-prev', nextEl: '#bs-next' }}
          autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          spaceBetween={20}
          breakpoints={{
            0:   { slidesPerView: 1.3 },
            480: { slidesPerView: 2.2 },
            768: { slidesPerView: 3 },
            1024:{ slidesPerView: 4 },
          }}
          className="!overflow-visible"
        >
          {products.map((p) => (
            <SwiperSlide key={p._id}>
              <ProductCard product={p} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="text-center mt-10">
          <Link to="/products" className="btn-secondary">
            View All Products <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
