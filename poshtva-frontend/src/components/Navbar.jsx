import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiChevronDown, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenu, setUserMenu]       = useState(false);
  const [scrolled, setScrolled]       = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/',        label: 'Home'     },
    { to: '/products',label: 'Products' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'}`}>
      <div className="page-container">
        <div className="flex items-center justify-between h-16 md:h-18">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow group-hover:scale-105 transition-transform bg-white overflow-hidden p-0.5">
              <img src="/Poshlogo.jpeg" alt="Poshatva Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="text-xl font-display font-bold text-forest-800">Poshatva</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'text-forest-600 bg-forest-50' : 'text-gray-600 hover:text-forest-600 hover:bg-forest-50'}`
              }>{label}</NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-xl text-gray-600 hover:text-forest-600 hover:bg-forest-50 transition-all">
              <FiShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-forest-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-forest-50 transition-all text-gray-700">
                  <div className="w-8 h-8 bg-forest-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                  <FiChevronDown className={`text-sm transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {userMenu && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-gray-100 overflow-hidden z-50">
                      <div className="p-3 bg-forest-50 border-b border-gray-100">
                        <p className="font-semibold text-forest-800 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="p-1">
                        {isAdmin && (
                          <Link to="/admin/dashboard" onClick={() => setUserMenu(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-forest-50 hover:text-forest-700 rounded-xl transition-all">
                            <FiSettings /> Admin Panel
                          </Link>
                        )}
                        <Link to="/profile" onClick={() => setUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-forest-50 hover:text-forest-700 rounded-xl transition-all">
                          <FiUser /> My Profile
                        </Link>
                        <Link to="/orders" onClick={() => setUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-forest-50 hover:text-forest-700 rounded-xl transition-all">
                          <FiPackage /> My Orders
                        </Link>
                        <button onClick={() => { logout(); setUserMenu(false); navigate('/'); }}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all w-full text-left">
                          <FiLogOut /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden md:block btn-outline text-sm py-2 px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-forest-50 transition-all">
              {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden">
            <nav className="page-container py-4 flex flex-col gap-1">
              {navLinks.map(({ to, label }) => (
                <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-medium ${isActive ? 'text-forest-600 bg-forest-50' : 'text-gray-700'}`
                  }>{label}</NavLink>
              ))}
              {!user && (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm font-medium text-gray-700">Login</Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
