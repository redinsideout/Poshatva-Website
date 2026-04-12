import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { ordersAPI } from '../../api/index';
import { PageLoader } from '../../components/LoadingSpinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave, FiMapPin } from 'react-icons/fi';

import { getImageUrl } from '../../utils/imageHelper';
const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrderDetail = () => {
  const { id }                  = useParams();
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    ordersAPI.getById(id)
      .then((d) => { setOrder(d.order); setNewStatus(d.order.orderStatus); setTrackingId(d.order.trackingId || ''); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      const data = await ordersAPI.updateStatus(id, { orderStatus: newStatus, trackingId });
      setOrder(data.order);
      toast.success('Order status updated!');
    } catch (err) {
      toast.error('Update failed');
    } finally { setSaving(false); }
  };

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>;
  if (!order) return <AdminLayout><p className="text-gray-500">Order not found</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/orders" className="p-2 rounded-xl hover:bg-gray-200 transition-colors"><FiArrowLeft /></Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="ml-auto"><OrderStatusBadge status={order.orderStatus} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Items + Summary */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.orderItems?.map((item, i) => {
                const imgSrc = getImageUrl(item.image);
                return (
                  <div key={i} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-14 h-14 bg-forest-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {imgSrc ? <img src={imgSrc} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">🌿</span>}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                    <p className="font-semibold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Customer</h3>
            <p className="font-medium text-gray-800">{order.user?.name}</p>
            <p className="text-sm text-gray-500">{order.user?.email}</p>
          </div>
        </div>

        {/* Right — Status, Payment, Address */}
        <div className="space-y-5">
          {/* Update Status */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Update Status</h3>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field text-sm mb-3">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <input placeholder="Tracking ID (optional)" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} className="input-field text-sm mb-3" />
            <button onClick={handleUpdateStatus} disabled={saving} className="btn-primary w-full text-sm py-2.5 justify-center">
              <FiSave /> {saving ? 'Saving...' : 'Update Status'}
            </button>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Payment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span>{order.isPaid ? <span className="badge-green">Paid</span> : <span className="badge-red">Unpaid</span>}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Items</span><span>₹{order.itemsPrice?.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>₹{order.taxPrice?.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span></div>
              <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span className="text-forest-700">₹{order.totalPrice?.toFixed(2)}</span></div>
            </div>
          </div>

          {/* Shipping */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FiMapPin /> Shipping Address</h3>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p>{order.shippingAddress?.pincode}</p>
              <p>{order.shippingAddress?.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;
