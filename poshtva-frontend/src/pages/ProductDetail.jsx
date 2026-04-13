import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiPlus, FiMinus, FiCheck, FiPackage, FiTruck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { PageLoader } from '../components/LoadingSpinner';
import { productsAPI } from '../api/products';
import { getImageUrl } from '../utils/imageHelper';
import { motion, AnimatePresence } from 'framer-motion';

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
    const ok = await addToCart(product._id, qty, product);
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

  const { name, description, price, discountPrice, stock, images, rating, numReviews, reviews, benefits, howToUse, category } = product;
  const effectivePrice = discountPrice > 0 ? discountPrice : price;
  const discount = discountPrice > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;

  return (
    <div className="pt-32 min-h-screen bg-white">
      <div className="page-container py-6">
        {/* Breadcrumb - Sleek & Subtle */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link to="/" className="hover:text-forest-600 transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link to="/products" className="hover:text-forest-600 transition-colors">Products</Link>
          <span className="text-gray-300">/</span>
          <span className="text-forest-800 font-bold">{name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left: Premium Gallery (Span 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] md:aspect-square bg-gray-50 rounded-[2.5rem] overflow-hidden group shadow-sm border border-gray-100">
              <AnimatePresence mode="wait">
                <motion.div key={selectedImg}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full"
                >
                  {images?.[selectedImg] ? (
                    <img src={getImageUrl(images[selectedImg])} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl bg-forest-50/30">🌿</div>
                  )}
                </motion.div>
              </AnimatePresence>

              {images?.length > 1 && (
                <>
                  <button onClick={() => setSelectedImg((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md shadow-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-90">
                    <FiChevronLeft className="text-xl text-forest-900" />
                  </button>
                  <button onClick={() => setSelectedImg((prev) => (prev + 1) % images.length)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md shadow-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-90">
                    <FiChevronRight className="text-xl text-forest-900" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images?.length > 1 && (
              <div className="flex gap-4 justify-center py-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImg === i ? 'border-forest-500 ring-4 ring-forest-50 shadow-lg scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}>
                    <img src={getImageUrl(img)} alt={`Thumbnail ${i+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Modern Info (Span 5) */}
          <div className="lg:col-span-5 flex flex-col pt-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {category && (
                <Link to={`/products?category=${category.name}`} 
                      className="inline-block px-3 py-1 rounded-full bg-forest-50 text-forest-600 text-[10px] uppercase font-bold tracking-widest mb-4 hover:bg-forest-100 transition-colors">
                  {category.name}
                </Link>
              )}
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-forest-950 mb-4 leading-[1.15]">
                {name}
              </h1>

              {/* Sophisticated Review Link */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={`text-base ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-400 border-l border-gray-200 pl-4">
                  {numReviews || 0} Verified Reviews
                </span>
              </div>

              {/* Price Block - Dramatic & Clean */}
              <div className="flex flex-col gap-1 mb-8">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-display font-extrabold text-forest-800 tracking-tight">₹{effectivePrice}</span>
                  {discount > 0 && (
                    <span className="text-2xl text-gray-300 line-through font-medium">₹{price}</span>
                  )}
                </div>
                {discount > 0 && (
                  <span className="text-xs font-bold text-green-600 tracking-wider">SPECIAL OFFER: SAVE {discount}% TODAY</span>
                )}
              </div>

              <p className="text-gray-500 text-lg leading-relaxed mb-8 border-l-4 border-forest-50 pl-6 italic">
                {description}
              </p>

              {/* Stock Status */}
              <div className="mb-10 text-sm">
                {stock > 0 ? (
                  <div className="flex items-center gap-2 text-forest-600 font-bold bg-forest-50/50 w-fit px-4 py-2 rounded-full border border-forest-100">
                    <FiCheck className="animate-pulse" />
                    {stock > 10 ? 'Available in Stock' : `Hurry! Only ${stock} items left`}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-500 font-bold bg-red-50 w-fit px-4 py-2 rounded-full border border-red-100">
                    <FiX /> Currently Out of Stock
                  </div>
                )}
              </div>

              {/* Functional Group: Qty + CTA */}
              {stock > 0 && (
                <div className="space-y-6 bg-gray-50 p-6 md:p-8 rounded-[2rem] border border-gray-100 mb-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-extrabold text-gray-400 tracking-widest">Select Quantity</span>
                    <div className="flex items-center bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} 
                              className="p-4 hover:bg-forest-50 transition-colors text-forest-800"><FiMinus /></button>
                      <span className="px-4 font-display font-bold text-lg min-w-[50px] text-center text-forest-950">{qty}</span>
                      <button onClick={() => setQty(Math.min(stock, qty + 1))} 
                              className="p-4 hover:bg-forest-50 transition-colors text-forest-800"><FiPlus /></button>
                    </div>
                  </div>

                  <button onClick={handleAddToCart} disabled={stock === 0}
                    className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-lg font-bold transition-all duration-500 transform
                    ${addedToCart ? 'bg-green-600 text-white scale-95' : 'bg-forest-600 text-white hover:bg-forest-700 hover:shadow-glow active:scale-[0.98]'}`}>
                    {addedToCart ? (
                      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                        <FiCheck strokeWidth={3} /> Added to Cart
                      </motion.div>
                    ) : (
                      <><FiShoppingBag /> Add to Basket</>
                    )}
                  </button>
                </div>
              )}

              {/* Trust Badges - Modern Icons */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: FiTruck,   text: 'Fast Delivery', sub: 'Calculated at checkout' },
                  { icon: FiPackage, text: 'Hassle-Free',  sub: '30-day return policy'     },
                ].map(({ icon: Icon, text, sub }) => (
                  <div key={text} className="flex flex-col gap-1 p-5 rounded-2xl border border-gray-100 hover:border-forest-200 transition-colors group">
                    <Icon className="text-2xl text-forest-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-forest-900">{text}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-medium">{sub}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Detailed Content Sections */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-gray-100 pt-16">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}>
             <h3 className="text-xs uppercase font-extrabold tracking-[0.2em] text-forest-500 mb-6">Experience & Design</h3>
             <h2 className="text-3xl font-display font-bold text-forest-950 mb-8">Key Benefits & Why We Built This</h2>
             {benefits?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-3xl bg-forest-50/30 border border-forest-50">
                      <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center shrink-0">
                        <FiCheck className="text-forest-600 text-sm" />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">{b}</p>
                    </div>
                  ))}
                </div>
             ) : (
                <p className="text-gray-500 italic">No specific benefits listed, but rest assured our organic quality is top-notch.</p>
             )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}>
             <h3 className="text-xs uppercase font-extrabold tracking-[0.2em] text-forest-500 mb-6">Expert Guidance</h3>
             <h2 className="text-3xl font-display font-bold text-forest-950 mb-8">How to Use Effectively</h2>
             <div className="prose prose-forest max-w-none">
               <p className="text-gray-600 text-lg leading-[1.8] bg-gray-50 p-8 rounded-[2rem] border-l-8 border-forest-500 shadow-inner">
                 {howToUse || "Add to your plants as needed for healthy, organic growth. Consult a specialist for specific dosage."}
               </p>
             </div>
          </motion.div>
        </div>

        {/* Reviews Section - Modern & Clean */}
        {reviews?.length > 0 && (
          <section className="mt-32 pt-24 border-t border-gray-100">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-forest-950 mb-4">Customer Chronicles</h2>
                <p className="text-gray-500 text-lg max-w-xl">Real stories from real plant parents who transformed their gardens.</p>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 px-8 py-4 rounded-full border border-gray-200">
                <span className="text-2xl font-bold text-forest-900">{rating} / 5</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={`text-xl ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((r, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={r._id} 
                  className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center font-bold text-forest-700 text-lg">
                      {r.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-forest-950">{r.name}</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={`text-[10px] ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed italic">"{r.comment}"</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
