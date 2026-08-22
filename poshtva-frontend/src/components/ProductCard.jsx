import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiStar, FiHeart, FiEye, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageHelper';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const { name, slug, images, price, discountPrice, rating, numReviews, stock, variants = [] } = product;
  const activeVariants = variants.filter((v) => v.isActive !== false);
  const defaultVariant = activeVariants[0];

  const basePrice = defaultVariant ? defaultVariant.price : price;
  const baseDiscountPrice = defaultVariant ? defaultVariant.discountPrice : discountPrice;
  const effectivePrice = baseDiscountPrice > 0 ? baseDiscountPrice : basePrice;
  const discount = baseDiscountPrice > 0 ? Math.round(((basePrice - baseDiscountPrice) / basePrice) * 100) : 0;
  const effectiveStock = defaultVariant ? defaultVariant.stock : stock;
  const imgSrc = getImageUrl(images?.[0]);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !wishlisted;
    setWishlisted(nextState);
    if (nextState) {
      toast.success(`"${name}" added to Wishlist!`);
    } else {
      toast.success(`Removed from Wishlist`);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product._id, 1, product, defaultVariant?._id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="card overflow-hidden group flex flex-col h-full bg-white relative border border-gray-100/50"
    >
      {/* Wishlist Heart */}
      <button 
        onClick={handleWishlist}
        className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur-sm border transition-all duration-300 ${
          wishlisted 
            ? 'bg-red-50 border-red-100 text-red-500' 
            : 'bg-white/80 border-gray-100 text-gray-500 hover:text-red-500'
        }`}
      >
        <FiHeart className={`text-sm ${wishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image */}
      <Link to={`/products/${slug}`} className="relative block overflow-hidden bg-[#F8FAF8] aspect-square">
        {imgSrc ? (
          <img 
            src={imgSrc} 
            alt={name} 
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-green-300">
            <span className="text-5xl">🌿</span>
            <span className="text-xs text-green-400 font-medium">Poshatva</span>
          </div>
        )}

        {/* Quick View and Actions Overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-10">
          <span className="bg-white/95 text-gray-900 text-xs font-bold px-4 py-2.5 rounded-full shadow-lg backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-1.5 hover:bg-green-50">
            <FiEye className="text-sm text-[#0B6B3A]" /> Quick View
          </span>
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              SAVE {discount}%
            </span>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {effectiveStock === 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-full tracking-wider uppercase">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${slug}`} className="block mb-1 group/title">
          <h3 className="font-display font-semibold text-gray-900 text-sm md:text-base line-clamp-2 leading-tight group-hover/title:text-[#0B6B3A] transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FiStar 
                key={i} 
                className={`text-xs ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 font-medium">({numReviews || 0})</span>
        </div>

        <div className="mt-auto space-y-3">
          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-[#0B6B3A]">₹{effectivePrice}</span>
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through font-medium">₹{basePrice}</span>
            )}
          </div>

          {/* Quick Buy / Add button */}
          <button
            onClick={handleAddToCart}
            disabled={effectiveStock === 0}
            className={`w-full py-2.5 rounded-xl font-bold text-xs md:text-sm tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 border shadow-sm ${
              effectiveStock === 0
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : added
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-[#1B8D4A] border-transparent text-white hover:bg-[#166C38]'
            }`}
          >
            {added ? (
              <>
                <FiCheck className="text-base" /> Added
              </>
            ) : (
              <>
                <FiShoppingCart className="text-base" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
