import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiStar, FiPlus, FiMinus, FiArrowLeft, FiCheck, FiPackage, FiTruck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { PageLoader } from '../components/LoadingSpinner';
import { productsAPI } from '../api/products';

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ProductDetail = () => {
  const { slug }                        = useParams();
  const { addToCart }                   = useCart();
  const [product, setProduct]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [qty, setQty]                   = useState(1);
  const [selectedImg, setSelectedImg]   = useState(0);
  const [addedToCart, setAddedToCart]   = useState(false);

  useEffect(() => {
    setLoading(true);
    productsAPI.getBySlug(slug)
      .then((data) => {
        setProduct(data.product);
        document.title = `${data.product.name} — Poshatva`;
      })
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    const ok = await addToCart(product._id, qty);
    if (ok) { setAddedToCart(true); setTimeout(() => setAddedToCart(false), 2000); }
  };

  if (loading) return <div className="pt-20"><PageLoader /></div>;
  if (error || !product) return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🌿</div>
        <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    </div>
  );

  const { name, description, richDescription, price, discountPrice, stock, images, rating, numReviews, reviews, benefits, howToUse, category } = product;
  const effectivePrice = discountPrice > 0 ? discountPrice : price;
  const discount = discountPrice > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="page-container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-forest-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-forest-600">Products</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-6 md:p-10 shadow-card">
          {/* Images */}
          <div>
            <div className="aspect-square bg-forest-50 rounded-2xl overflow-hidden mb-4">
              {images?.[selectedImg] ? (
                <img src={`${API_URL}${images[selectedImg]}`} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🌿</div>
              )}
            </div>
            {images?.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-forest-500' : 'border-transparent'}`}>
                    <img src={`${API_URL}${img}`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {category && <Link to={`/products?category=${category.name}`} className="inline-block badge-green mb-3">{category.name}</Link>}
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-3">{name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={`text-sm ${i < Math.round(rating) ? 'text-earth-400' : 'text-gray-300'}`} style={{ fill: i < Math.round(rating) ? 'currentColor' : 'none' }} />
                ))}
              </div>
              <span className="text-sm text-gray-500">({numReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-bold text-forest-700">₹{effectivePrice}</span>
              {discount > 0 && (
                <>
                  <span className="text-xl text-gray-400 line-through">₹{price}</span>
                  <span className="badge-green text-sm">Save {discount}%</span>
                </>
              )}
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              {stock > 0 ? (
                <><FiCheck className="text-green-500" /><span className="text-green-600 font-medium text-sm">{stock > 10 ? 'In Stock' : `Only ${stock} left!`}</span></>
              ) : (
                <span className="text-red-500 font-medium text-sm">Out of Stock</span>
              )}
            </div>

            {/* Quantity */}
            {stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 hover:bg-gray-100 transition-colors"><FiMinus className="text-sm" /></button>
                  <span className="px-4 py-3 font-semibold min-w-[40px] text-center text-sm">{qty}</span>
                  <button onClick={() => setQty(Math.min(stock, qty + 1))} className="px-4 py-3 hover:bg-gray-100 transition-colors"><FiPlus className="text-sm" /></button>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mb-8">
              <button onClick={handleAddToCart} disabled={stock === 0}
                className={`flex-1 btn-primary py-4 text-base transition-all ${addedToCart ? 'bg-green-600' : ''}`}>
                {addedToCart ? <><FiCheck /> Added!</> : <><FiShoppingCart /> Add to Cart</>}
              </button>
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FiTruck,   text: 'Free shipping above ₹499' },
                { icon: FiPackage, text: '30-day return policy'      },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 p-3 bg-forest-50 rounded-xl text-xs text-forest-700">
                  <Icon className="flex-shrink-0" /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details Tabs */}
        <div className="mt-8 bg-white rounded-3xl p-6 md:p-10 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {benefits?.length > 0 && (
              <div>
                <h3 className="font-display text-xl font-bold text-forest-800 mb-4">Key Benefits</h3>
                <ul className="space-y-2">
                  {benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                      <FiCheck className="text-forest-500 mt-0.5 flex-shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {howToUse && (
              <div>
                <h3 className="font-display text-xl font-bold text-forest-800 mb-4">How to Use</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{howToUse}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {reviews?.length > 0 && (
          <div className="mt-8 bg-white rounded-3xl p-6 md:p-10 shadow-card">
            <h3 className="font-display text-xl font-bold text-forest-800 mb-6">Customer Reviews</h3>
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r._id} className="border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-800">{r.name}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={`text-xs ${i < r.rating ? 'text-earth-400' : 'text-gray-300'}`} style={{ fill: i < r.rating ? 'currentColor' : 'none' }} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
