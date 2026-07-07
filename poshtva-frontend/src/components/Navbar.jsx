import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiSettings, FiSearch, FiShoppingBag, FiHeart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenu, setUserMenu]       = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible]     = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // Scrolling down - hide
      } else {
        setIsVisible(true);  // Scrolling up - show
      }
      setScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const megaMenuItems = {
    "Plants": ["Indoor Plants", "Outdoor Plants", "Flower Plants", "Fruit Plants", "Succulents", "Vegetables"],
    "Seeds": ["Vegetable Seeds", "Flower Seeds", "Fruit Seeds", "Herb Seeds"],
    "Potting Mix": ["Succulent Mix", "Vegetable Mix", "Flower Mix", "Indoor Mix"],
    "Soil": ["Garden Soil", "Organic Soil"],
    "Cocopeat": ["Premium Block", "Powder Form"],
    "Vermicompost": ["Pure Organic", "Premium Compost"],
    "Fertilizers": ["Neem Cake", "Bone Meal", "Seaweed", "Humic Acid"],
    "Garden Tools": ["Watering Can", "Pruners", "Sprayers"]
  };

  return (
    <motion.header 
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -130 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${scrolled ? 'shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-transparent' : 'border-b border-gray-100'}`}
    >
      
      {/* Top Banner Message */}
      <div className="bg-[#0B6B3A] text-white text-xs py-2 text-center font-semibold tracking-wider px-4 flex items-center justify-center gap-2">
        <span>🌱 Free Shipping on all orders above ₹499!</span>
        <span className="hidden md:inline font-normal">| Use Code <strong className="bg-white/20 px-2 py-0.5 rounded text-white text-[11px] ml-1">WELCOME10</strong> for 10% discount!</span>
      </div>

      {/* Main Header Container */}
      <div className="bg-white">
        <div className="page-container">
          <div className="flex items-center justify-between h-14 md:h-20 gap-4 md:gap-8">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 md:gap-2.5 shrink-0 group">
              <div className="w-8 h-8 md:w-11 md:h-11 bg-white rounded-lg md:rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 p-0.5 group-hover:scale-105 transition-transform duration-300">
                <img src="/Poshlogo.jpeg" alt="Poshatva Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <span className="text-base md:text-2xl font-display font-black text-gray-900 tracking-tight">Poshatva</span>
            </Link>

            {/* Desktop Large Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0B6B3A] transition-colors text-base" />
              <input 
                type="text" 
                placeholder="Search for premium cocopeat, seeds, organic potting mix..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8FAF8] border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-green-400/10 focus:border-[#1B8D4A] focus:bg-white transition-all duration-300"
              />
            </form>

            {/* Right Actions Menu */}
            <div className="flex items-center gap-1 md:gap-4">
              {/* WhatsApp Help */}
              <a href="https://wa.me/918445684783" target="_blank" rel="noreferrer" 
                 className="hidden md:flex p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all text-xl" title="WhatsApp Support">
                <FaWhatsapp />
              </a>

              {/* Wishlist Link */}
              <Link to="/profile" className="hidden sm:flex p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-xl" title="Wishlist">
                <FiHeart />
              </Link>

              {/* User Account / Profile */}
              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenu(!userMenu)} 
                          className="flex items-center gap-1 p-2 text-gray-600 hover:text-[#0B6B3A] hover:bg-green-50 rounded-xl transition-all">
                    <FiUser className="text-xl" />
                  </button>
                  <AnimatePresence>
                    {userMenu && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                        <div className="p-4 bg-green-50/50 border-b border-gray-100 text-sm">
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="p-1.5">
                          {isAdmin && (
                            <Link to="/admin/dashboard" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-lg">
                              <FiSettings /> Dashboard
                            </Link>
                          )}
                          <Link to="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-lg">
                            <FiUser /> Profile
                          </Link>
                          <Link to="/orders" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-lg">
                            <FiPackage /> Orders
                          </Link>
                          <button onClick={() => { logout(); setUserMenu(false); navigate('/'); }}
                                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                            <FiLogOut /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="p-2 text-gray-500 hover:text-[#0B6B3A] hover:bg-green-50 rounded-xl transition-all" title="Account"><FiUser className="text-xl" /></Link>
              )}

              {/* Shopping Bag / Cart */}
              <Link to="/cart" className="relative p-2 text-gray-500 hover:text-[#0B6B3A] hover:bg-green-50 rounded-xl transition-all" title="Cart">
                <FiShoppingBag className="text-xl" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#1B8D4A] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Hamburger Mobile Menu */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600 hover:bg-green-50 rounded-xl">
                {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Navigation Links with Hover Mega Menu */}
      <div className="hidden md:block bg-white border-t border-gray-100">
        <div className="page-container">
          <nav className="flex items-center justify-center gap-6 h-12 text-[12px] font-bold tracking-wider text-gray-700">
            <Link to="/products" className="hover:text-[#0B6B3A] transition-colors py-3 border-b-2 border-transparent hover:border-[#1B8D4A]">All Products</Link>
            
            {/* Mega Menu Triggers */}
            {Object.keys(megaMenuItems).map((key) => (
              <div key={key} className="relative group/nav py-3">
                <button className="hover:text-[#0B6B3A] font-bold uppercase transition-colors flex items-center gap-0.5 cursor-pointer">
                  {key}
                </button>
                {/* Mega Dropdown Panel */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[450px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 opacity-0 translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all duration-300 grid grid-cols-2 gap-4 z-50">
                  <div>
                    <h5 className="text-[11px] uppercase tracking-widest text-[#0B6B3A] font-black border-b border-gray-100 pb-1.5 mb-2">{key} Types</h5>
                    <ul className="space-y-1.5">
                      {megaMenuItems[key].slice(0, 4).map((subItem) => (
                        <li key={subItem}>
                          <Link 
                            to={`/products?search=${encodeURIComponent(subItem)}`}
                            className="text-gray-500 hover:text-gray-900 transition-colors font-medium text-xs block py-0.5"
                          >
                            {subItem}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-[11px] uppercase tracking-widest text-[#0B6B3A] font-black border-b border-gray-100 pb-1.5 mb-2">Grow Organic</h5>
                    <ul className="space-y-1.5">
                      {megaMenuItems[key].slice(4).map((subItem) => (
                        <li key={subItem}>
                          <Link 
                            to={`/products?search=${encodeURIComponent(subItem)}`}
                            className="text-gray-500 hover:text-gray-900 transition-colors font-medium text-xs block py-0.5"
                          >
                            {subItem}
                          </Link>
                        </li>
                      ))}
                      {megaMenuItems[key].length <= 4 && (
                        <li>
                          <Link to="/products" className="text-gray-400 hover:text-[#0B6B3A] transition-colors font-semibold text-xs block py-0.5">
                            Browse Collection →
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
            
            <Link to="/products?featured=true" className="hover:text-red-500 transition-colors py-3 border-b-2 border-transparent hover:border-red-500 whitespace-nowrap text-red-600 font-extrabold uppercase">Offers 🔥</Link>
          </nav>
        </div>
      </div>

      {/* Mobile Search Bar - Visible only on mobile */}
      <div className="md:hidden bg-white px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search premium plant care..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8FAF8] border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-green-400/20 focus:border-[#1B8D4A]"
          />
        </form>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                        className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[70] shadow-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-display font-black text-xl text-gray-900">Menu</span>
                  <button onClick={() => setMobileOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg"><FiX className="text-xl" /></button>
                </div>
                <nav className="flex flex-col gap-4">
                  <Link to="/" onClick={() => setMobileOpen(false)} className="text-base font-bold text-gray-800 border-b border-gray-50 pb-2">Home</Link>
                  <Link to="/products" onClick={() => setMobileOpen(false)} className="text-base font-bold text-gray-800 border-b border-gray-50 pb-2">All Products</Link>
                  <div className="py-2">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Categories</p>
                    <div className="flex flex-col gap-3 pl-2 max-h-[50vh] overflow-y-auto">
                      {Object.keys(megaMenuItems).map((key) => (
                        <Link key={key} to={`/products?search=${encodeURIComponent(key)}`} onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-gray-600 hover:text-[#0B6B3A]">
                          {key}
                        </Link>
                      ))}
                    </div>
                  </div>
                </nav>
              </div>
              
              {/* WhatsApp footer support */}
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <a href="https://wa.me/918445684783" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-green-600">
                  <FaWhatsapp className="text-lg" /> Chat on WhatsApp
                </a>
                <span className="text-[10px] text-gray-400 font-medium">v1.2.0</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
