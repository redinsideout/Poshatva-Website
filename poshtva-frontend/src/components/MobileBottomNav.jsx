import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiHeart, FiShoppingBag, FiUser } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();

  const getIsActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { label: 'Home', icon: FiHome, to: '/' },
    { label: 'Categories', icon: FiGrid, to: '/products' },
    { label: 'Wishlist', icon: FiHeart, to: '/profile' }, // Fallback to profile for now since wishlist uses it
    { label: 'Cart', icon: FiShoppingBag, to: '/cart', badgeCount: cartCount },
    { label: 'Account', icon: FiUser, to: '/profile' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] px-2 py-1">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item, index) => {
          const isActive = getIsActive(item.to);
          return (
            <Link 
              key={index} 
              to={item.to} 
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-[#0B6B3A]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon className="text-xl stroke-[2]" />
              <span className="text-[10px] font-semibold mt-0.5 tracking-tight">{item.label}</span>
              
              {/* Active Dot Indicator */}
              {isActive && (
                <span className="absolute top-0 w-1 h-1 rounded-full bg-[#0B6B3A]" />
              )}

              {/* Cart Badge */}
              {item.badgeCount > 0 && (
                <span className="absolute top-0.5 right-1/4 bg-[#1B8D4A] text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {item.badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
