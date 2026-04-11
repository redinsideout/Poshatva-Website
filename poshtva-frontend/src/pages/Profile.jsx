import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../api/index';
import { PageLoader } from '../components/LoadingSpinner';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { FiPackage, FiUser, FiMail, FiPhone, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../api/auth';

const Profile = () => {
  const { user, updateUser }        = useAuth();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editMode, setEditMode]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState({ name: user?.name || '', phone: user?.phone || '' });

  useEffect(() => {
    document.title = 'My Profile — Poshatva';
    ordersAPI.getMyOrders()
      .then((d) => setOrders(d.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await authAPI.update(form);
      updateUser(data.user);
      setEditMode(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally { setSaving(false); }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="page-container py-10">
        <h1 className="section-title mb-8">My Account</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-forest-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h2 className="font-display font-bold text-xl text-gray-900">{user?.name}</h2>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                {user?.role === 'admin' && <span className="badge-green mt-2">Admin</span>}
              </div>

              {/* Edit Form */}
              {editMode ? (
                <div className="space-y-3">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field text-sm" placeholder="Full Name" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input-field text-sm" placeholder="Phone Number" />
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-2 text-sm justify-center">
                      <FiCheck /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditMode(false)} className="btn-outline flex-1 py-2 text-sm justify-center">
                      <FiX /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setEditMode(true)} className="btn-outline w-full justify-center py-2 text-sm">
                  <FiEdit2 /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-gray-800 mb-5 flex items-center gap-2">
                <FiPackage className="text-forest-500" /> Order History
              </h3>
              {loading ? <PageLoader /> : orders.length === 0 ? (
                <div className="text-center py-10">
                  <FiPackage className="text-5xl text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link to="/products" className="btn-primary mt-4 text-sm py-2 px-4">Start Shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Link key={order._id} to={`/orders/${order._id}`}
                      className="block border border-gray-100 rounded-2xl p-4 hover:border-forest-300 hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm text-gray-500">#{order._id.slice(-8).toUpperCase()}</span>
                        <OrderStatusBadge status={order.orderStatus} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{order.orderItems?.length} item(s)</span>
                        <span className="font-bold text-forest-700">₹{order.totalPrice?.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
