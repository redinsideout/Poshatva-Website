import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiPackage, FiShoppingBag, FiUsers, FiLogOut, FiMenu } from 'react-icons/fi';


const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);

  const links = [
    { to: '/admin/dashboard', icon: FiGrid,      label: 'Dashboard' },
    { to: '/admin/products',  icon: FiShoppingBag, label: 'Products'  },
    { to: '/admin/orders',    icon: FiPackage,   label: 'Orders'    },
    { to: '/admin/users',     icon: FiUsers,     label: 'Users'     },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-forest-900 text-white flex flex-col transition-transform duration-300 ${sideOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-forest-700">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden p-0.5">
              <img src="/Poshlogo.jpeg" alt="Poshatva Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <span className="font-display font-bold text-lg">Poshatva</span>
              <span className="block text-xs text-forest-300">Admin Panel</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-forest-500 text-white' : 'text-forest-200 hover:bg-forest-700 hover:text-white'}`
              }>
              <Icon className="text-base" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-forest-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-forest-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{user?.name}</p>
              <p className="text-xs text-forest-300 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors w-full">
            <FiLogOut /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sideOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-20">
          <button onClick={() => setSideOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <FiMenu className="text-xl" />
          </button>
          <span className="font-display font-bold text-forest-800">Admin Panel</span>
        </div>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
