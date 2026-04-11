import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import { GiSolidLeaf } from 'react-icons/gi';
import { motion } from 'framer-motion';

const Register = () => {
  const { register }          = useAuth();
  const navigate              = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

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
        <div className="relative z-10 text-center text-white p-10 flex flex-col items-center">
          <div className="w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center overflow-hidden mb-6 animate-float p-2 text-center">
            <img src="/Poshlogo.jpeg" alt="Poshatva" className="w-full h-full object-contain rounded-2xl" />
          </div>
          <h2 className="text-4xl font-display font-bold mb-4">Join Poshatva</h2>
          <p className="text-green-100 text-lg">Start your green journey today</p>
          <div className="grid grid-cols-3 gap-6 mt-10">
            {[['Free', 'Shipping above ₹499'], ['100%', 'Organic'], ['30-Day', 'Returns']].map(([val, label]) => (
              <div key={label}>
                <div className="text-2xl font-bold">{val}</div>
                <div className="text-green-200 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md py-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow overflow-hidden p-0.5">
              <img src="/Poshlogo.jpeg" alt="Poshatva" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="text-xl font-display font-bold text-forest-800">Poshatva</span>
          </div>
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
