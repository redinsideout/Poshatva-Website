import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiChevronRight } from 'react-icons/fi';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { login, register, loginWithFirebase } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Email/Password States
  const [showPass, setShowPass] = useState(false);
  const [emailForm, setEmailForm] = useState({ name: '', email: '', password: '' });

  // Reset states on open/close
  useEffect(() => {
    if (isOpen) {
      setTab('login');
      setError('');
      setLoading(false);
      setEmailForm({ name: '', email: '', password: '' });
    }
  }, [isOpen]);

  const handleEmailChange = (e) => setEmailForm({ ...emailForm, [e.target.name]: e.target.value });

  // Traditional email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (tab === 'login') {
        await login(emailForm.email, emailForm.password);
        toast.success('Welcome back! 🌱');
      } else {
        await register(emailForm.name, emailForm.email, emailForm.password);
        toast.success('Account created successfully! 🌿');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Google Login flow
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await loginWithFirebase(result.user);
      toast.success('Signed in with Google! 🌿');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is disabled. Please enable "Google" in the Firebase Console (Authentication > Sign-in method).');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in the Firebase Console. Go to Authentication > Settings > Authorized domains and add this domain.');
      } else {
        setError(err.message || 'Google Sign-In failed');
      }
      toast.error('Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  // Guest Checkout flow
  const handleGuestCheckout = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-gray-100"
          >
            {/* Header / Gradient Top */}
            <div className="relative px-8 pt-8 pb-5 bg-gradient-to-br from-forest-50/50 to-earth-50/50 border-b border-gray-50">
              <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                <FiX className="text-xl" />
              </button>
              
              <div className="text-4xl mb-3 select-none">🌿</div>
              
              <h2 className="text-2xl font-display font-extrabold text-gray-900 leading-tight">
                Checkout Account
              </h2>
              
              <p className="text-gray-500 text-sm mt-1.5 font-medium">
                Choose how you would like to proceed with your order.
              </p>
            </div>

            {/* Error Message Panel */}
            {error && (
              <div className="mx-8 mt-4 p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl flex items-center">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Content area */}
            <div className="px-8 py-6 space-y-5">
              
              {/* Primary Actions: Google & Guest */}
              <div className="space-y-3">
                {/* Google Login Button */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-6 border border-gray-200 hover:border-gray-300 rounded-2xl transition-all flex items-center justify-center gap-3 text-sm shadow-sm select-none"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.09 14.974 0 12 0 7.354 0 3.307 2.69 1.268 6.609l3.998 3.156z"
                    />
                    <path
                      fill="#4285F4"
                      d="M16.04 15.345c-1.077.73-2.5 1.173-4.04 1.173a7.07 7.07 0 0 1-6.734-4.856L1.268 14.82A11.96 11.96 0 0 0 12 24c2.93 0 5.736-1.043 7.834-3l-3.793-3.655z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M1.268 6.609A11.89 11.89 0 0 0 0 12c0 1.923.456 3.736 1.268 5.391l3.998-3.156A7.03 7.03 0 0 1 4.91 12c0-1.17.275-2.28.756-3.267L1.268 6.61z"
                    />
                    <path
                      fill="#34A853"
                      d="M23.52 12.273c0-.818-.073-1.609-.208-2.373H12v4.5h6.49a5.55 5.55 0 0 1-2.41 3.655l3.793 3.655c2.215-2.04 3.647-5.04 3.647-8.773z"
                    />
                  </svg>
                  Continue with Google
                </button>

                {/* Guest Checkout Button */}
                <button
                  onClick={handleGuestCheckout}
                  disabled={loading}
                  className="w-full bg-forest-50 hover:bg-forest-100 text-forest-700 font-bold py-3.5 px-6 border border-forest-100 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm select-none"
                >
                  <FiUser className="text-base" /> Continue as Guest
                </button>
              </div>

              <div className="relative flex items-center justify-center my-6">
                <div className="border-t border-gray-100 w-full"></div>
                <span className="absolute px-4 bg-white text-xs font-bold text-gray-400 uppercase tracking-wider select-none">Or Email Login</span>
              </div>

              {/* Tabs for Traditional Login / Register */}
              <div className="flex gap-1 bg-gray-50 rounded-xl p-1">
                {['login', 'register'].map((t) => (
                  <button key={t} type="button" onClick={() => setTab(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t ? 'bg-white text-forest-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {t === 'login' ? 'Login' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {tab === 'register' && (
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Full Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                      <input
                        name="name"
                        type="text"
                        required
                        value={emailForm.name}
                        onChange={handleEmailChange}
                        placeholder="Your full name"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 focus:bg-white border border-gray-200 focus:border-forest-500 rounded-2xl outline-none transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                    <input
                      name="email"
                      type="email"
                      required
                      value={emailForm.email}
                      onChange={handleEmailChange}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 focus:bg-white border border-gray-200 focus:border-forest-500 rounded-2xl outline-none transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                    <input
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength="6"
                      value={emailForm.password}
                      onChange={handleEmailChange}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-10 py-3 bg-gray-50 focus:bg-white border border-gray-200 focus:border-forest-500 rounded-2xl outline-none transition-all text-sm font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-base"
                    >
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-forest-600 hover:bg-forest-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md shadow-forest-100 hover:shadow-lg flex items-center justify-center gap-2 text-sm select-none mt-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : tab === 'login' ? (
                    '🔐 Login & Continue'
                  ) : (
                    '🌱 Create Account'
                  )}
                </button>
              </form>
              
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
