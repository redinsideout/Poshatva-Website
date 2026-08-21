import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { ordersAPI, shiprocketAPI } from '../../api/index';
import { PageLoader } from '../../components/LoadingSpinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave, FiMapPin, FiTruck, FiPackage, FiDownload, FiRefreshCw, FiSend, FiExternalLink } from 'react-icons/fi';

import { getImageUrl } from '../../utils/imageHelper';
const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrderDetail = () => {
  const { id }                  = useParams();
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [saving, setSaving]     = useState(false);

  // Shiprocket states
  const [srPushing, setSrPushing]     = useState(false);
  const [srTracking, setSrTracking]   = useState(false);
  const [srLabeling, setSrLabeling]   = useState(false);
  const [srPickup, setSrPickup]       = useState(false);
  const [srAwbRetry, setSrAwbRetry]   = useState(false);
  const [trackingData, setTrackingData] = useState(null);

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

  // ── Shiprocket Actions ──────────────────────────────────

  const handlePushToShiprocket = async () => {
    setSrPushing(true);
    try {
      const data = await shiprocketAPI.pushOrder(id);
      setOrder(data.order);
      setTrackingId(data.order.trackingId || '');
      toast.success('Order pushed to Shiprocket!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to push to Shiprocket');
    } finally { setSrPushing(false); }
  };

  const handleTrackShipment = async () => {
    setSrTracking(true);
    setTrackingData(null);
    try {
      const data = await shiprocketAPI.trackOrder(id);
      setTrackingData(data.tracking);
      toast.success('Tracking data fetched!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch tracking');
    } finally { setSrTracking(false); }
  };

  const handleGenerateLabel = async () => {
    setSrLabeling(true);
    try {
      const data = await shiprocketAPI.generateLabel(id);
      if (data.labelUrl) {
        window.open(data.labelUrl, '_blank');
        // Refresh order to get updated labelUrl
        const refreshed = await ordersAPI.getById(id);
        setOrder(refreshed.order);
        toast.success('Label generated!');
      } else {
        toast.error('No label URL returned');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate label');
    } finally { setSrLabeling(false); }
  };

  const handleSchedulePickup = async () => {
    setSrPickup(true);
    try {
      await shiprocketAPI.schedulePickup(id);
      toast.success('Pickup scheduled!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule pickup');
    } finally { setSrPickup(false); }
  };

  const handleRetryAWB = async () => {
    setSrAwbRetry(true);
    try {
      const data = await shiprocketAPI.retryAssignAWB(id);
      setOrder(data.order);
      setTrackingId(data.order.trackingId || '');
      toast.success(`AWB assigned: ${data.awbCode}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign AWB');
    } finally { setSrAwbRetry(false); }
  };

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>;
  if (!order) return <AdminLayout><p className="text-gray-500">Order not found</p></AdminLayout>;

  const sr = order.shiprocket || {};
  const hasSR = !!sr.orderId;

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
            {order.user ? (
              <>
                <p className="font-medium text-gray-800">{order.user.name}</p>
                <p className="text-sm text-gray-500">{order.user.email}</p>
                <span className="text-xs bg-forest-50 text-forest-700 px-2 py-0.5 rounded-full font-bold mt-2 inline-block">Registered Account</span>
              </>
            ) : (
              <>
                <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
                <p className="text-sm text-gray-500">{order.shippingAddress?.phone}</p>
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold mt-2 inline-block">Guest Checkout</span>
              </>
            )}
          </div>

          {/* ── Shiprocket Section ─────────────────────────── */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiTruck className="text-blue-500" /> Shiprocket Fulfillment
            </h3>

            {!hasSR ? (
              /* Not yet pushed */
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-4">This order has not been pushed to Shiprocket yet.</p>
                <button
                  onClick={handlePushToShiprocket}
                  disabled={srPushing}
                  className="btn-primary text-sm py-2.5 px-6 inline-flex items-center gap-2"
                >
                  <FiSend /> {srPushing ? 'Pushing...' : 'Push to Shiprocket'}
                </button>
              </div>
            ) : (
              /* Shiprocket details */
              <div className="space-y-4">
                {/* Status grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-gray-500 text-xs mb-1">Shiprocket Order</p>
                    <p className="font-bold text-gray-800">#{sr.orderId}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-gray-500 text-xs mb-1">Shipment ID</p>
                    <p className="font-bold text-gray-800">{sr.shipmentId || '—'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-gray-500 text-xs mb-1">AWB Code</p>
                    <p className="font-bold text-gray-800 font-mono">{sr.awbCode || '—'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-gray-500 text-xs mb-1">Courier</p>
                    <p className="font-bold text-gray-800">{sr.courierName || '—'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                    <p className="text-gray-500 text-xs mb-1">Shiprocket Status</p>
                    <p className="font-bold text-blue-600">{sr.status || '—'}</p>
                    {sr.pushedAt && <p className="text-xs text-gray-400 mt-1">Pushed: {new Date(sr.pushedAt).toLocaleString('en-IN')}</p>}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {!sr.awbCode && (
                    <button onClick={handleRetryAWB} disabled={srAwbRetry} className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5">
                      <FiRefreshCw className={srAwbRetry ? 'animate-spin' : ''} /> {srAwbRetry ? 'Assigning...' : 'Assign AWB'}
                    </button>
                  )}
                  {sr.awbCode && (
                    <>
                      <button onClick={handleTrackShipment} disabled={srTracking} className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5">
                        <FiPackage className={srTracking ? 'animate-spin' : ''} /> {srTracking ? 'Loading...' : 'Track'}
                      </button>
                      <button onClick={handleGenerateLabel} disabled={srLabeling} className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5">
                        <FiDownload /> {srLabeling ? 'Loading...' : 'Label'}
                      </button>
                      <button onClick={handleSchedulePickup} disabled={srPickup} className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5">
                        <FiTruck /> {srPickup ? 'Scheduling...' : 'Pickup'}
                      </button>
                    </>
                  )}
                  {sr.labelUrl && (
                    <a href={sr.labelUrl} target="_blank" rel="noreferrer" className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5 text-blue-600">
                      <FiExternalLink /> View Label
                    </a>
                  )}
                </div>

                {/* Tracking data */}
                {trackingData && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm max-h-60 overflow-y-auto">
                    <h4 className="font-semibold text-blue-800 mb-2">Live Tracking</h4>
                    <pre className="text-xs text-blue-900 whitespace-pre-wrap break-words">
                      {JSON.stringify(trackingData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
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
            <div className="space-y-2 text-sm text-left">
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span>{order.isPaid ? <span className="badge-green">Paid</span> : <span className="badge-red">Unpaid</span>}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-semibold text-gray-700">{order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online (Razorpay)'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Items</span><span>₹{order.itemsPrice?.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>₹{order.taxPrice?.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span></div>
              {order.codCharge > 0 && (
                <div className="flex justify-between"><span className="text-gray-500">COD Charge</span><span>₹{order.codCharge.toFixed(2)}</span></div>
              )}
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
