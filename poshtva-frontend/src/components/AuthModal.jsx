import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [tab, setTab]             = useState('login');
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [form, setForm]           = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back! 🌱');
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created! 🌿');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-forest-50 to-earth-50">
              <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-xl hover:bg-white/70 transition-colors text-gray-500">
                <FiX className="text-lg" />
              </button>
              <div className="text-3xl mb-2">🌿</div>
              <h2 className="text-2xl font-display font-bold text-gray-900">
                {tab === 'login' ? 'Welcome back!' : 'Join Poshatva'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {tab === 'login' ? 'Login to complete your purchase' : 'Create an account to checkout'}
              </p>

              {/* Tabs */}
              <div className="flex gap-1 mt-5 bg-white/60 rounded-xl p-1">
                {['login', 'register'].map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-forest-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {t === 'login' ? 'Login' : 'Sign Up'}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="name" type="text" required value={form.name} onChange={handleChange}
                      placeholder="Your full name" className="input-field pl-10" />
                  </div>
                </div>
              )}
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="email" type="email" required value={form.email} onChange={handleChange}
                    placeholder="you@example.com" className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="password" type={showPass ? 'text' : 'password'} required value={form.password} onChange={handleChange}
                    placeholder="••••••••" className="input-field pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3.5 justify-center text-base mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {tab === 'login' ? 'Logging in...' : 'Creating account...'}
                  </span>
                ) : (tab === 'login' ? '🔐 Login & Continue' : '🌱 Create Account')}
              </button>

              <p className="text-center text-sm text-gray-500">
                {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button type="button" onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
                  className="text-forest-600 font-semibold hover:underline">
                  {tab === 'login' ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
