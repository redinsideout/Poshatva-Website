import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { motion } from 'framer-motion';

const Register = () => {
  const { register, loginWithFirebase } = useAuth();
  const navigate              = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await loginWithFirebase(result.user);
      toast.success('Welcome to Poshatva! 🌱');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6)       { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to Poshatva 🌱');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-bg items-center justify-center relative overflow-hidden">
        <Link to="/" className="relative z-10 text-center text-white p-10 flex flex-col items-center hover:scale-105 transition-transform">
          <div className="w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center overflow-hidden mb-6 animate-float p-2 text-center">
            <img src="/Poshlogo.jpeg" alt="Poshatva" className="w-full h-full object-contain rounded-2xl" />
          </div>
          <h2 className="text-4xl font-display font-bold mb-4">Join Poshatva</h2>
          <p className="text-green-100 text-lg">Start your green journey today</p>
          <div className="grid grid-cols-3 gap-6 mt-10">
            {[['Free', 'Shipping on all orders'], ['100%', 'Organic'], ['30-Day', 'Returns']].map(([val, label]) => (
              <div key={label}>
                <div className="text-2xl font-bold">{val}</div>
                <div className="text-green-200 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md py-8">
          <Link to="/" className="flex items-center gap-2 mb-8 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow overflow-hidden p-0.5 group-hover:scale-110 transition-transform">
              <img src="/Poshlogo.jpeg" alt="Poshatva" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="text-xl font-display font-bold text-forest-800 group-hover:text-forest-600 transition-colors">Poshatva</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Create account</h1>
          <p className="text-gray-500 mb-8">Join thousands of happy plant parents</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name',    label: 'Full Name',       type: 'text',     icon: FiUser,  placeholder: 'Your full name'      },
              { name: 'email',   label: 'Email Address',   type: 'email',    icon: FiMail,  placeholder: 'you@example.com'     },
            ].map(({ name, label, type, icon: Icon, placeholder }) => (
              <div key={name}>
                <label className="label">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={type} placeholder={placeholder} value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })} required className="input-field pl-10" />
                </div>
              </div>
            ))}
            {['password', 'confirm'].map((field) => (
              <div key={field}>
                <label className="label">{field === 'password' ? 'Password' : 'Confirm Password'}</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })} required className="input-field pl-10 pr-10" />
                  {field === 'confirm' && (
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base justify-center mt-2">
              {loading ? 'Creating account...' : <><span>Create Account</span><FiArrowRight /></>}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="absolute px-4 bg-white text-xs font-bold text-gray-400 uppercase tracking-wider select-none">Or Continue with</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-6 border border-gray-200 hover:border-gray-300 rounded-2xl transition-all flex items-center justify-center gap-3 text-sm shadow-sm select-none mb-6"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.09 14.974 0 12 0 7.354 0 3.307 2.69 1.268 6.609l3.998 3.156z" />
              <path fill="#4285F4" d="M16.04 15.345c-1.077.73-2.5 1.173-4.04 1.173a7.07 7.07 0 0 1-6.734-4.856L1.268 14.82A11.96 11.96 0 0 0 12 24c2.93 0 5.736-1.043 7.834-3l-3.793-3.655z" />
              <path fill="#FBBC05" d="M1.268 6.609A11.89 11.89 0 0 0 0 12c0 1.923.456 3.736 1.268 5.391l3.998-3.156A7.03 7.03 0 0 1 4.91 12c0-1.17.275-2.28.756-3.267L1.268 6.61z" />
              <path fill="#34A853" d="M23.52 12.273c0-.818-.073-1.609-.208-2.373H12v4.5h6.49a5.55 5.55 0 0 1-2.41 3.655l3.793 3.655c2.215-2.04 3.647-5.04 3.647-8.773z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-forest-600 font-semibold hover:text-forest-700">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
