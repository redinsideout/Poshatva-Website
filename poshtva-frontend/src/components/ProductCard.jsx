import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiStar, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { getImageUrl } from '../utils/imageHelper';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { name, slug, images, price, discountPrice, rating, numReviews, stock, isFeatured } = product;
  const effectivePrice = discountPrice > 0 ? discountPrice : price;
  const discount = discountPrice > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const imgSrc = getImageUrl(images?.[0]);

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
      className="card overflow-hidden group flex flex-col">
      {/* Image */}
      <Link to={`/products/${slug}`} className="relative block overflow-hidden bg-forest-50 aspect-square">
        {imgSrc ? (
          <img src={imgSrc} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-forest-300">
            <span className="text-5xl">🌿</span>
            <span className="text-xs text-forest-400">{name.split(' ')[0]}</span>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isFeatured && (
            <span className="flex items-center gap-1 bg-earth-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              <FiZap className="text-xs" /> Featured
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              -{discount}%
            </span>
          )}
          {stock === 0 && (
            <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${slug}`} className="group/title">
          <h3 className="font-display font-semibold text-gray-800 group-hover/title:text-forest-600 transition-colors line-clamp-2 mb-1 text-sm md:text-base">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} className={`text-xs ${i < Math.round(rating) ? 'text-earth-400 fill-earth-400' : 'text-gray-300'}`} style={{ fill: i < Math.round(rating) ? 'currentColor' : 'none' }} />
            ))}
          </div>
          <span className="text-xs text-gray-400">({numReviews})</span>
        </div>

        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-forest-700">₹{effectivePrice}</span>
            {discount > 0 && <span className="text-sm text-gray-400 line-through">₹{price}</span>}
          </div>

          {/* Add to Cart */}
          <button
            onClick={() => addToCart(product._id, 1, product)}
            disabled={stock === 0}
            className="w-full btn-primary text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
            <FiShoppingCart />
            {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
