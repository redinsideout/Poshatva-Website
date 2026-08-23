import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FiStar, FiPlus, FiMinus, FiCheck, 
  FiTruck, FiChevronLeft, FiChevronRight, FiShoppingBag,
  FiMapPin, FiGift, FiAward, FiInfo, FiHelpCircle
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { PageLoader } from '../components/LoadingSpinner';
import { productsAPI } from '../api/products';
import { getImageUrl } from '../utils/imageHelper';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ProductDetail = () => {
  const { slug }                        = useParams();
  const { addToCart }                   = useCart();
  const [product, setProduct]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [qty, setQty]                   = useState(1);
  const [selectedImg, setSelectedImg]   = useState(0);
  const [addedToCart, setAddedToCart]   = useState(false);
  
  const [pincode, setPincode]           = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [showSticky, setShowSticky]     = useState(false);
  const [activeTab, setActiveTab]       = useState('desc');

  useEffect(() => {
    setLoading(true);
    productsAPI.getBySlug(slug)
      .then((data) => {
        setProduct(data.product);
        document.title = `${data.product.name} — Poshatva`;
        // Auto-select first active variant if present
        const activeVars = data.product.variants?.filter(v => v.isActive !== false) || [];
        if (activeVars.length > 0) {
          setSelectedVariantId(activeVars[0]._id);
        }
      })
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));

    const handleScroll = () => setShowSticky(window.scrollY > 800);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug]);

  if (loading) return <div className="pt-32"><PageLoader /></div>;
  if (error || !product) return (
    <div className="pt-32 min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h2 className="text-4xl font-display font-bold mb-4">Product was replanted...</h2>
        <p className="text-gray-500 mb-8 text-lg">We couldn't find the page you're looking for.</p>
        <Link to="/products" className="btn-primary px-8">Return to Shop</Link>
      </div>
    </div>
  );

  const { name, description, price, discountPrice, stock, images, rating, numReviews, category, howToUse, variants = [] } = product;
  const activeVariants = variants.filter(v => v.isActive !== false);
  const hasVariants = activeVariants.length > 0;

  // Resolve current active variant or fallback to product root pricing
  const currentVariant = hasVariants
    ? (activeVariants.find(v => String(v._id) === String(selectedVariantId)) || activeVariants[0])
    : null;

  const currentPrice = currentVariant
    ? (currentVariant.discountPrice > 0 ? currentVariant.discountPrice : currentVariant.price)
    : (discountPrice > 0 ? discountPrice : price);

  const currentMrp = currentVariant ? currentVariant.price : price;
  const currentStock = currentVariant ? currentVariant.stock : stock;
  const discount = currentDiscount(currentMrp, currentPrice);

  function currentDiscount(mrp, selPrice) {
    if (mrp > selPrice) {
      return Math.round(((mrp - selPrice) / mrp) * 100);
    }
    return 0;
  }

  const handleAddToCart = async () => {
    if (currentStock <= 0) {
      toast.error('Selected size is currently out of stock');
      return;
    }
    const ok = await addToCart(product._id, qty, product, currentVariant?._id);
    if (ok) { 
      setAddedToCart(true); 
      setTimeout(() => setAddedToCart(false), 2000); 
    }
  };

  const checkDelivery = async (e) => {
    e.preventDefault();
    if (pincode.length !== 6) return toast.error('Enter valid 6-digit pincode');
    
    setCheckingPincode(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0].Status === 'Success') {
        const date = new Date();
        date.setDate(date.getDate() + 4);
        const dateStr = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
        setDeliveryInfo({ city: data[0].PostOffice[0].District, date: dateStr });
      } else {
        toast.error('Invalid Pincode');
      }
    } catch (err) {
      toast.error('Could not check delivery');
    } finally {
      setCheckingPincode(false);
    }
  };

  return (
    <div className="pt-32 min-h-screen bg-white text-forest-950 font-sans">
      
      {/* 1. Breadcrumbs */}
      <div className="page-container py-4 border-b border-gray-50">
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">
          <Link to="/" className="hover:text-forest-600">Home</Link>
          <FiChevronRight />
          <Link to="/products" className="hover:text-forest-600">{category?.name || 'Shop'}</Link>
          <FiChevronRight />
          <span className="text-forest-700">{name}</span>
        </nav>
      </div>

      <div className="page-container py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 mb-24">
          
          {/* 2. Gallery Block */}
          <div className="space-y-6">
            <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden group shadow-inner border border-gray-100/50">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={selectedImg}
                  src={getImageUrl(images[selectedImg])} 
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-contain p-8 md:p-12 hover:scale-105 transition-transform duration-700 cursor-zoom-in" 
                />
              </AnimatePresence>
              
              {images.length > 1 && (
                <>
                  <button onClick={() => setSelectedImg((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-forest-50">
                    <FiChevronLeft className="text-xl" />
                  </button>
                  <button onClick={() => setSelectedImg((prev) => (prev + 1) % images.length)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-forest-50">
                    <FiChevronRight className="text-xl" />
                  </button>
                </>
              )}
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all p-2 bg-gray-50 ${
                    selectedImg === i ? 'border-forest-600 scale-105' : 'border-transparent opacity-60'
                  }`}>
                  <img src={getImageUrl(img)} className="w-full h-full object-contain" alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* 3. Info & Dynamic Pricing Block */}
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold mb-4 leading-tight">{name}</h1>
            
            <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-6">
              <div className="flex items-center bg-forest-900 text-white px-3 py-1 rounded-lg gap-1.5 text-sm font-bold shadow-glow">
                <FiStar className="fill-white" /> {rating} | {numReviews}
              </div>
              <div className="text-xs uppercase font-bold tracking-widest text-gray-400">Verified Quality</div>
            </div>

            {/* Dynamic Price Display */}
            <div className="mb-8">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-5xl font-display font-black text-forest-800 tracking-tight">₹{currentPrice}</span>
                {discount > 0 && <span className="text-2xl text-gray-300 line-through font-medium">₹{currentMrp}</span>}
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                    SAVE {discount}%
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-gray-400 tracking-wider">(Incl. of all taxes)</p>
            </div>

            {/* Dynamic Variants Selector */}
            {hasVariants && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs uppercase font-extrabold text-gray-500 tracking-widest block">AVAILABLE SIZES</span>
                  {currentVariant && (
                    <span className="text-xs font-semibold text-forest-700">Selected: {currentVariant.name}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {activeVariants.map((v) => {
                    const isSelected = String(v._id) === String(currentVariant?._id);
                    const isOutOfStock = v.stock <= 0;
                    const vPrice = v.discountPrice > 0 ? v.discountPrice : v.price;
                    return (
                      <button
                        key={v._id}
                        type="button"
                        onClick={() => setSelectedVariantId(String(v._id))}
                        className={`px-6 py-3.5 rounded-2xl border-2 transition-all text-sm font-bold flex flex-col items-center gap-0.5 relative ${
                          isSelected
                            ? 'border-forest-600 bg-forest-50 text-forest-900 shadow-md transform -translate-y-1'
                            : 'border-gray-200 hover:border-forest-300 text-gray-700 bg-white'
                        } ${isOutOfStock ? 'opacity-60' : ''}`}
                      >
                        <span className="text-sm font-black">{v.name}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-forest-700 font-bold' : 'text-gray-500'}`}>₹{vPrice}</span>
                        {isOutOfStock && (
                          <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded-full mt-0.5">
                            Out of Stock
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delivery Checker */}
            <div className="mb-12 bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-forest-50 flex items-center justify-center text-forest-600"><FiMapPin /></div>
                <span className="text-base font-bold">Check Delivery & Availability</span>
              </div>
              
              <form onSubmit={checkDelivery} className="flex gap-2 max-w-sm">
                <input 
                  type="text" 
                  placeholder="Enter 6-digit pincode" 
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                />
                <button type="submit" disabled={checkingPincode}
                  className="bg-forest-800 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-forest-900 transition-all">
                  {checkingPincode ? 'Checking...' : 'Check'}
                </button>
              </form>

              {deliveryInfo && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-4">
                  <FiTruck className="text-3xl text-forest-500" />
                  <div>
                    <p className="text-sm font-bold text-forest-900">Estimated Delivery By: {deliveryInfo.date}</p>
                    <p className="text-[10px] uppercase text-gray-400 tracking-widest">Shipping to {deliveryInfo.city}</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Main Action Group */}
            <div className="space-y-6 mb-12">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-[2rem] border border-gray-100">
                <div className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-4 hover:bg-forest-50 text-forest-800 transition-colors"><FiMinus /></button>
                  <span className="px-6 font-display font-bold text-xl min-w-[60px] text-center">{qty}</span>
                  <button onClick={() => setQty(Math.min(currentStock || 99, qty + 1))} className="p-4 hover:bg-forest-50 text-forest-800 transition-colors"><FiPlus /></button>
                </div>
                <div className="text-right pr-4">
                  <div className="text-xs uppercase font-extrabold text-gray-400 tracking-tighter">Total Price</div>
                  <div className="text-2xl font-black text-forest-900">₹{currentPrice * qty}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className={`py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95
                  ${currentStock <= 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                    : addedToCart
                      ? 'bg-green-600 text-white'
                      : 'bg-forest-900 text-white hover:bg-black shadow-xl hover:shadow-forest-500/20'}`}
                >
                  {currentStock <= 0 ? 'Out of Stock' : (addedToCart ? <FiCheck strokeWidth={3} /> : <FiShoppingBag />)}
                  {currentStock <= 0 ? '' : (addedToCart ? 'Added!' : 'Add to Bag')}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className={`py-5 rounded-2xl bg-white border-2 border-forest-900 text-forest-900 font-bold hover:bg-forest-50 transition-all flex items-center justify-center ${currentStock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Buy It Now
                </button>
              </div>
            </div>

            {/* Quick Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: FiTruck, title: 'Free Shipping', sub: 'On all orders' },
                { icon: FiGift,  title: 'Gift Packaging', sub: 'Eco-friendly safe pack' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-5 rounded-3xl bg-forest-50/30 border border-forest-50">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-forest-600 shadow-sm"><item.icon className="text-xl" /></div>
                  <div>
                    <h4 className="text-sm font-bold">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 leading-tight uppercase tracking-widest">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Marketing Section */}
        <section className="mt-32 space-y-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }}>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight leading-[1.1] mb-8">
                Healthy Soil = <br/><span className="text-forest-600">Healthy Plants</span>
              </h2>
              <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-lg italic">
                "{description}"
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 px-6 py-4 rounded-full bg-forest-950 text-white font-bold text-sm shadow-xl">
                  <FiAward className="text-xl text-amber-400" /> Expert-prepared
                </div>
                <div className="flex items-center gap-3 px-6 py-4 rounded-full bg-forest-50 text-forest-700 font-bold text-sm border border-forest-100">
                  <FiCheck className="text-lg" /> 100% Organic
                </div>
              </div>
            </motion.div>
            <div className="rounded-[4rem] overflow-hidden shadow-2xl bg-forest-50 aspect-[4/3]">
              <img 
                src="file:///C:/Users/hp/.gemini/antigravity/brain/167db14e-bb01-4827-9ae5-3d3b8469ef4d/healthy_soil_living_plants_1776082599821.png" 
                alt="Healthy Soil" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </section>

        {/* Specifications & FAQ */}
        <section className="mt-32 pt-24 border-t border-gray-100">
          <div className="flex gap-12 mb-12 border-b border-gray-100">
            {[
              { id: 'specs', label: 'Specifications', icon: FiInfo },
              { id: 'how', label: 'Guidelines', icon: FiHelpCircle },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-6 text-sm font-bold uppercase tracking-widest transition-all relative
                ${activeTab === tab.id ? 'text-forest-900 border-b-2 border-forest-900' : 'text-gray-300 hover:text-gray-500'}`}>
                <tab.icon className="text-lg" /> {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'specs' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-1">
                {[
                  { label: 'Product Name', value: name },
                  { label: 'Category', value: category?.name || 'Organic Care' },
                  { label: 'Country of Origin', value: 'INDIA 🇮🇳' },
                  { label: 'Marketed by', value: 'Poshatva Heritage Pvt Ltd.' },
                  { label: 'Net Quantity', value: currentVariant?.name || `${product.weight || '1'} ${product.unit || 'kg'}` },
                ].map((spec, i) => (
                  <div key={i} className="flex items-center justify-between py-5 border-b border-gray-50 group">
                    <span className="text-sm text-gray-500 group-hover:text-forest-900 transition-colors font-medium">{spec.label}</span>
                    <span className="text-sm font-bold text-forest-800">{spec.value}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'how' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-forest lg:prose-xl max-w-none bg-gray-50 p-12 rounded-[3.5rem] shadow-inner">
                <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-3"><FiAward className="text-forest-500" /> Professional Application Guide</h3>
                <p className="text-gray-600 leading-loose text-lg whitespace-pre-wrap">{howToUse || "Apply 1-2 cups per plant bucket monthly. Mix well with top soil and water immediately."}</p>
              </motion.div>
            )}
          </div>
        </section>
      </div>

      {/* Sticky Bottom Bar */}
      <AnimatePresence>
        {showSticky && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-100 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] md:pb-4"
          >
            <div className="page-container h-24 md:h-28 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl p-2 border border-gray-100 shrink-0 hidden sm:block">
                  <img src={getImageUrl(images[0])} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-forest-950 truncate max-w-[200px]">{name}</h4>
                  <p className="text-lg font-black text-forest-800">₹{currentPrice} {currentVariant ? `(${currentVariant.name})` : ''}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {hasVariants && (
                  <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2">
                    <select
                      value={selectedVariantId}
                      onChange={(e) => setSelectedVariantId(e.target.value)}
                      className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer pr-2"
                    >
                      {activeVariants.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.name} - ₹{v.discountPrice > 0 ? v.discountPrice : v.price}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button onClick={handleAddToCart} disabled={currentStock <= 0}
                  className={`flex items-center justify-center gap-3 h-14 px-8 md:px-12 rounded-2xl font-bold transition-all shadow-xl hover:shadow-forest-500/20 active:scale-95
                  ${currentStock <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : addedToCart ? 'bg-green-600 text-white' : 'bg-forest-900 text-white hover:bg-black'}`}>
                  {currentStock <= 0 ? 'Out of Stock' : (addedToCart ? <FiCheck strokeWidth={3} /> : <FiShoppingBag />)}
                  <span className="hidden sm:inline">{currentStock <= 0 ? '' : (addedToCart ? 'Added!' : 'Add to Basket')}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
