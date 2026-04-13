import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiSettings, FiSearch, FiShoppingBag } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { categoriesAPI } from '../api';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenu, setUserMenu]       = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [categories, setCategories]   = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible]     = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine visibility
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // Scrolling down - hide
      } else {
        setIsVisible(true);  // Scrolling up - show
      }
      
      setScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    categoriesAPI.getAll().then(res => setCategories(res.categories || [])).catch(console.error);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <motion.header 
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -130 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm border-b border-gray-100'}`}
    >
      
      {/* Top Row: Logo, Search, Basic Actions */}
      <div className="bg-white">
        <div className="page-container">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4 md:gap-8">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/Poshlogo.jpeg" alt="Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
              <span className="text-xl md:text-2xl font-display font-bold text-forest-900 tracking-tight">Poshatva</span>
            </Link>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-forest-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search for Plants, Seeds, organic tools..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/10 focus:border-forest-500 transition-all"
              />
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-4">
              <a href="https://wa.me/918445684783" target="_blank" rel="noreferrer" 
                 className="p-2 text-forest-500 hover:bg-forest-50 rounded-full transition-all text-xl" title="WhatsApp Support">
                <FaWhatsapp />
              </a>

              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenu(!userMenu)} 
                          className="flex items-center gap-1 p-2 text-gray-600 hover:text-forest-600 hover:bg-forest-50 rounded-full transition-all">
                    <FiUser className="text-xl" />
                  </button>
                  <AnimatePresence>
                    {userMenu && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                        <div className="p-4 bg-forest-50 border-b border-gray-100 text-sm">
                          <p className="font-bold text-forest-800">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="p-1.5">
                          {isAdmin && (
                            <Link to="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-forest-50 rounded-lg">
                              <FiSettings /> Dashboard
                            </Link>
                          )}
                          <Link to="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-forest-50 rounded-lg">
                            <FiUser /> Profile
                          </Link>
                          <Link to="/orders" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-forest-50 rounded-lg">
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
                <Link to="/login" className="p-2 text-gray-600 hover:text-forest-600 transition-all"><FiUser className="text-xl" /></Link>
              )}

              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-forest-600 transition-all">
                <FiShoppingBag className="text-xl" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-0.5 bg-forest-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600">
                {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Navigation Links */}
      <div className="hidden md:block bg-white border-t border-gray-50 overflow-x-auto scrollbar-hide">
        <div className="page-container">
          <nav className="flex items-center justify-center gap-8 h-12 uppercase text-[11px] font-bold tracking-widest text-gray-600">
            <Link to="/products" className="hover:text-forest-600 transition-colors py-2 border-b-2 border-transparent hover:border-forest-500">All Plants</Link>
            {categories.slice(0, 8).map(cat => (
              <Link key={cat._id} to={`/products?category=${cat.name}`} 
                    className="hover:text-forest-600 transition-colors py-2 border-b-2 border-transparent hover:border-forest-500 whitespace-nowrap">
                {cat.name}
              </Link>
            ))}
            <Link to="/products?featured=true" className="hover:text-forest-600 transition-colors py-2 border-b-2 border-transparent hover:border-forest-500 whitespace-nowrap">Offers</Link>
          </nav>
        </div>
      </div>

      {/* Mobile Search - Visible only on mobile */}
      <div className="md:hidden bg-white px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-9 pr-4 text-sm"
          />
        </form>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 bg-black/50 z-[60]" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                        className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[70] shadow-2xl p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="font-display font-bold text-xl text-forest-800">Menu</span>
                <button onClick={() => setMobileOpen(false)}><FiX className="text-2xl" /></button>
              </div>
              <nav className="flex flex-col gap-4">
                <Link to="/" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-gray-800">Home</Link>
                <Link to="/products" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-gray-800 border-b border-gray-50 pb-2">All Products</Link>
                <div className="py-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Categories</p>
                  <div className="flex flex-col gap-4 pl-2">
                    {categories.map(cat => (
                      <Link key={cat._id} to={`/products?category=${cat.name}`} onClick={() => setMobileOpen(false)} className="text-gray-600 hover:text-forest-600">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
