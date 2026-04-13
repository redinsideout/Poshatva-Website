import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield, FiTruck, FiStar } from 'react-icons/fi';
import { GiSolidLeaf } from 'react-icons/gi';
import ProductCard from '../components/ProductCard';
import { PageLoader } from '../components/LoadingSpinner';
import { productsAPI } from '../api/index';

const CATEGORIES = [
  { name: 'Cocopeat',    slug: 'cocopeat',     icon: '🥥', desc: 'Perfect growing medium',    color: 'from-amber-50 to-amber-100 border-amber-200',   textColor: 'text-amber-800' },
  { name: 'Vermicompost',slug: 'vermicompost', icon: '🪱', desc: 'Nature\'s best fertilizer', color: 'from-lime-50 to-lime-100 border-lime-200',       textColor: 'text-lime-800'  },
  { name: 'Bone Meal',   slug: 'bone-meal',    icon: '🦴', desc: 'High phosphorus boost',     color: 'from-orange-50 to-orange-100 border-orange-200', textColor: 'text-orange-800'},
  { name: 'Potting Mix', slug: 'potting-mix',  icon: '🌱', desc: 'Ready-to-use blend',        color: 'from-green-50 to-green-100 border-green-200',    textColor: 'text-green-800' },
  { name: 'Fertilizers', slug: 'fertilizers',  icon: '💧', desc: 'Organic plant nutrition',   color: 'from-blue-50 to-blue-100 border-blue-200',      textColor: 'text-blue-800'  },
];

const FEATURES = [
  { icon: GiSolidLeaf,   title: '100% Organic',       desc: 'All products are certified organic with no harmful chemicals'  },
  { icon: FiTruck,  title: 'Fast Delivery',       desc: 'Free shipping on orders above ₹499. Delivered in 3–5 days'     },
  { icon: FiShield, title: 'Quality Guaranteed',  desc: 'Lab-tested quality with 30-day satisfaction guarantee'         },
  { icon: FiStar,   title: 'Expert Support',      desc: 'Get personalized advice from our horticulture experts'          },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma',    rating: 5, comment: 'The cocopeat from Poshatva is amazing! My vegetable garden has never looked better.', location: 'Mumbai'      },
  { name: 'Rajesh Kumar',    rating: 5, comment: 'Best vermicompost I\'ve ever used. My plants are thriving and the quality is top notch.', location: 'Delhi'  },
  { name: 'Ananya Nair',     rating: 4, comment: 'Excellent potting mix. Perfect drainage and my succulents love it!', location: 'Bengaluru'                   },
  { name: 'Amit Patel',      rating: 5, comment: 'Seaweed fertilizer is a game changer. Visible results in just 2 weeks!', location: 'Ahmedabad'               },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading]                   = useState(true);

  useEffect(() => {
    document.title = 'Poshatva — Organic Plant-Based Products';
    productsAPI.getAll({ featured: true, limit: 4 })
      .then((data) => setFeaturedProducts(data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-28">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden gradient-bg">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-leaf/10 rounded-full blur-3xl" />
        </div>
        <div className="page-container relative z-10 py-20">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 bg-white/15 text-green-200 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                100% Organic &amp; Sustainable
              </span>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
                Grow Better,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-lime-300">
                  Live Greener
                </span>
              </h1>
              <p className="text-xl text-green-100 mb-10 leading-relaxed max-w-2xl">
                Premium organic plant-care products — cocopeat, vermicompost, fertilizers &amp; more. Sourced sustainably, delivered fresh to your door.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="inline-flex items-center gap-2 bg-white text-forest-800 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transition-all shadow-lg hover:shadow-xl active:scale-95">
                  Shop Now <FiArrowRight />
                </Link>
                <Link to="/products?featured=true" className="inline-flex items-center gap-2 border-2 border-white/40 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all">
                  Featured Products
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
              className="grid grid-cols-3 gap-6 mt-16 max-w-lg">
              {[['500+', 'Happy Customers'], ['100%', 'Organic'], ['5★', 'Average Rating']].map(([val, label]) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-bold text-white">{val}</div>
                  <div className="text-green-200 text-sm mt-1">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Decorative floating elements */}
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="hidden lg:block absolute right-16 top-24 text-9xl opacity-20 select-none">🌿</motion.div>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="hidden lg:block absolute right-48 bottom-24 text-7xl opacity-20 select-none">🍃</motion.div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-white">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Everything your plants need, all in one place</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <Link to={`/products?search=${cat.name}`}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 bg-gradient-to-br ${cat.color} hover:shadow-md transition-all duration-300 group`}>
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                  <div className="text-center">
                    <div className={`font-display font-semibold text-sm ${cat.textColor}`}>{cat.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{cat.desc}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-gray-50">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Our best-selling organic products</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-forest-600 font-semibold hover:text-forest-700 transition-colors">
              View All <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <PageLoader />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((p, i) => (
                <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
              {!loading && featuredProducts.length === 0 && (
                <p className="col-span-full text-center text-gray-400 py-10">
                  No featured products yet. <Link to="/products" className="text-forest-600 underline">Browse all products</Link>
                </p>
              )}
            </div>
          )}

          <div className="text-center mt-10 md:hidden">
            <Link to="/products" className="btn-primary">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Why Poshatva */}
      <section className="section-padding bg-white">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Choose Poshatva?</h2>
            <p className="section-subtitle">Your plants deserve the best — and so do you</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-forest-50 transition-all group">
                <div className="w-14 h-14 bg-forest-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-forest-500 transition-colors">
                  <f.icon className="text-2xl text-forest-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-forest-900">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">What Gardeners Say</h2>
            <p className="text-forest-200 mt-2 text-lg">Join thousands of happy plant parents</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-forest-800 rounded-2xl p-6 border border-forest-700">
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <FiStar key={j} className="text-earth-400 text-sm" style={{ fill: 'currentColor' }} />
                  ))}
                </div>
                <p className="text-forest-100 text-sm leading-relaxed mb-4">"{t.comment}"</p>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-forest-300 text-xs">{t.location}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-leaf to-forest-600">
        <div className="page-container text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">Start Your Green Journey</h2>
          <p className="text-green-100 text-xl mb-8">First order? Get 10% off with code <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">WELCOME10</span></p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-white text-forest-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all shadow-lg active:scale-95">
            Shop Now <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
