import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

import { motion } from 'framer-motion';

const Login = () => {
  const { login }             = useAuth();
  const navigate              = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🌱');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        </div>
        <Link to="/" className="relative z-10 text-center text-white p-10 flex flex-col items-center hover:scale-105 transition-transform">
          <div className="w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center overflow-hidden mb-6 animate-float p-2 text-center">
            <img src="/Poshlogo.jpeg" alt="Poshatva" className="w-full h-full object-contain rounded-2xl" />
          </div>
          <h2 className="text-4xl font-display font-bold mb-4">Welcome back!</h2>
          <p className="text-green-100 text-lg">Your plants missed you 🌿</p>
        </Link>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow overflow-hidden p-0.5 group-hover:scale-110 transition-transform">
              <img src="/Poshlogo.jpeg" alt="Poshatva" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="text-xl font-display font-bold text-forest-800 group-hover:text-forest-600 transition-colors">Poshatva</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Sign in</h1>
          <p className="text-gray-500 mb-8">Welcome back to Poshatva</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base justify-center">
              {loading ? 'Signing in...' : <><span>Sign In</span><FiArrowRight /></>}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-forest-600 font-semibold hover:text-forest-700">Create one</Link>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;
