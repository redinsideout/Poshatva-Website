import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

// Import newly created homepage subcomponents
import HeroSlider from '../components/home/HeroSlider';
import TrustBar from '../components/home/TrustBar';
import CategoryGrid from '../components/home/CategoryGrid';
import BestSellers from '../components/home/BestSellers';
import PlantTypeSection from '../components/home/PlantTypeSection';
import ComparisonSection from '../components/home/ComparisonSection';
import BrandStory from '../components/home/BrandStory';
import TestimonialsSlider from '../components/home/TestimonialsSlider';
import InstagramSection from '../components/home/InstagramSection';
import Newsletter from '../components/home/Newsletter';

import ProductCard from '../components/ProductCard';
import { PageLoader } from '../components/LoadingSpinner';
import { productsAPI } from '../api/index';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Poshatva — Premium Organic Plant-Based Products';

    const loadHomeData = async () => {
      try {
        setLoading(true);
        // 1. Fetch featured products
        const featuredData = await productsAPI.getAll({ featured: 'true', limit: 8 });
        setFeaturedProducts(featuredData.products || []);

        // 2. Fetch best sellers (sorted by rating)
        const bestData = await productsAPI.getAll({ sort: 'rating', limit: 8 });
        setBestSellers(bestData.products || []);

        // 3. Fetch new arrivals (sorted by newest)
        const newData = await productsAPI.getAll({ sort: 'newest', limit: 4 });
        setNewArrivals(newData.products || []);
      } catch (err) {
        console.error('Failed to load homepage products data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-20">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-32 pb-16 md:pb-0 bg-white">
      {/* 1. Hero Auto Slider */}
      <HeroSlider />

      {/* 2. Trust Bar Section */}
      <TrustBar />

      {/* 3. Shop by Category circular list */}
      <CategoryGrid />

      {/* 4. Featured Products Section */}
      <section className="section-padding bg-white">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#1B8D4A] font-semibold text-sm uppercase tracking-widest mb-2">Selected Selection</p>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Our handpicked recommendations for your garden</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-[#0B6B3A] font-bold hover:text-[#166C38] transition-colors">
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p, i) => (
              <motion.div 
                key={p._id} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} 
                viewport={{ once: true }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>

          {featuredProducts.length === 0 && (
            <p className="text-center text-gray-400 py-12 font-medium">
              No featured products available. <Link to="/products" className="text-[#0B6B3A] underline">Browse all</Link>
            </p>
          )}

          <div className="text-center mt-10 md:hidden">
            <Link to="/products" className="btn-primary w-full py-3.5">View All Products</Link>
          </div>
        </div>
      </section>

      {/* 5. Best Sellers swiper carousel */}
      <BestSellers products={bestSellers} />

      {/* 6. New Arrivals Section */}
      <section className="section-padding bg-[#F8FAF8]">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#1B8D4A] font-semibold text-sm uppercase tracking-widest mb-2">Freshly Added</p>
              <h2 className="section-title">New Arrivals</h2>
              <p className="section-subtitle">Explore our latest organic supplies</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-[#0B6B3A] font-bold hover:text-[#166C38] transition-colors">
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((p, i) => (
              <motion.div 
                key={p._id} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} 
                viewport={{ once: true }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>

          {newArrivals.length === 0 && (
            <p className="text-center text-gray-400 py-12 font-medium">
              No new arrivals available at the moment.
            </p>
          )}
        </div>
      </section>

      {/* 7. Shop by Plant Type */}
      <PlantTypeSection />

      {/* 8. Comparison Section (Why Choose Us) */}
      <ComparisonSection />

      {/* 9. Brand Story */}
      <BrandStory />

      {/* 10. Testimonials Slider */}
      <TestimonialsSlider />

      {/* 11. Instagram Section */}
      <InstagramSection />

      {/* 12. Newsletter Section */}
      <Newsletter />
    </div>
  );
};

export default Home;
