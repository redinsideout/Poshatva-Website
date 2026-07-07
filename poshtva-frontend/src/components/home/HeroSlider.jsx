import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const SLIDES = [
  {
    id: 1,
    badge: '🌿 100% Organic & Certified',
    heading: 'Grow Beautiful Plants',
    headingAccent: 'At Home',
    sub: 'Everything you need for gardening in one place — cocopeat, vermicompost, potting mixes & more. Delivered fresh to your door.',
    cta: { label: 'Shop Now', to: '/products' },
    ctaSecondary: { label: 'Explore Categories', to: '/products' },
    bg: 'from-[#052e16] via-[#0B6B3A] to-[#1E8E3E]',
    emoji: '🌱',
    stats: [['10K+', 'Happy Gardeners'], ['100%', 'Organic'], ['4.9★', 'Avg Rating']],
  },
  {
    id: 2,
    badge: '🌻 Fresh Stock — Season Sale',
    heading: 'Premium Cocopeat',
    headingAccent: '& Vermicompost',
    sub: 'Lab-tested, pH-balanced growing media for healthier roots, stronger plants and bigger harvests. Trusted by 10,000+ gardeners.',
    cta: { label: 'Buy Now', to: '/products' },
    ctaSecondary: { label: 'Learn More', to: '/products' },
    bg: 'from-[#052e16] via-[#0a4a2a] to-[#0B6B3A]',
    emoji: '🥥',
    stats: [['5★', 'Reviews'], ['Fast', 'Delivery'], ['Fresh', 'Quality']],
  },
  {
    id: 3,
    badge: '🎁 First Order — 10% Off with WELCOME10',
    heading: 'Nature-Powered',
    headingAccent: 'Fertilizers',
    sub: 'Bone meal, seaweed extract, neem cake & humic acid — give your plants the nutrition they truly deserve. 100% chemical-free.',
    cta: { label: 'Start Shopping', to: '/products' },
    ctaSecondary: { label: 'View Offers', to: '/products?featured=true' },
    bg: 'from-[#0a3d20] via-[#0B6B3A] to-[#2aab52]',
    emoji: '🌿',
    stats: [['30-Day', 'Guarantee'], ['Free', 'Shipping'], ['Expert', 'Support']],
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((idx) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = useCallback(() => { setDirection(1); setCurrent(c => (c + 1) % SLIDES.length); }, []);

  useEffect(() => {
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [next]);

  const slide = SLIDES[current];

  const variants = {
    enter: (d) => ({ x: d > 0 ? '8%' : '-8%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? '-8%' : '8%', opacity: 0 }),
  };

  return (
    <section className={`relative min-h-[88vh] flex items-center overflow-hidden bg-gradient-to-br ${slide.bg} transition-all duration-700`}>
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="page-container relative z-10 py-24 w-full"
        >
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/15 text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20 backdrop-blur-sm"
            >
              {slide.badge}
            </motion.span>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="text-5xl md:text-7xl font-display font-black text-white mb-4 leading-[1.05] tracking-tight"
            >
              {slide.heading}{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-lime-300">
                {slide.headingAccent}
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-green-100 mb-10 leading-relaxed max-w-2xl"
            >
              {slide.sub}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="flex flex-wrap gap-4 mb-14"
            >
              <Link to={slide.cta.to} className="btn-white text-base px-8 py-4">
                {slide.cta.label} <FiArrowRight />
              </Link>
              <Link to={slide.ctaSecondary.to} className="btn-outline-white text-base px-8 py-4">
                {slide.ctaSecondary.label}
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="flex flex-wrap gap-8"
            >
              {slide.stats.map(([val, label]) => (
                <div key={label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">{val}</div>
                  <div className="text-green-200 text-xs md:text-sm mt-0.5">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Floating emoji */}
      <motion.div
        key={`emoji-${slide.id}`}
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 text-[220px] select-none pointer-events-none"
      >
        {slide.emoji}
      </motion.div>

      {/* Navigation arrows */}
      <button onClick={prev} aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/15 hover:bg-white/25 border border-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all">
        <FiChevronLeft className="text-xl" />
      </button>
      <button onClick={() => goTo((current + 1) % SLIDES.length)} aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/15 hover:bg-white/25 border border-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all">
        <FiChevronRight className="text-xl" />
      </button>

      {/* Dot navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
