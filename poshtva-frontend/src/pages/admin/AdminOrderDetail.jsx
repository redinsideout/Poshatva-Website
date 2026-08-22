import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { ordersAPI, shiprocketAPI } from '../../api/index';
import { PageLoader } from '../../components/LoadingSpinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiSave, FiMapPin, FiTruck, FiPackage,
  FiDownload, FiRefreshCw, FiSend, FiExternalLink,
  FiFileText, FiAlertCircle, FiX
} from 'react-icons/fi';

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
  const [srPushing, setSrPushing]       = useState(false);
  const [srTracking, setSrTracking]     = useState(false);
  const [srLabeling, setSrLabeling]     = useState(false);
  const [srPickup, setSrPickup]         = useState(false);
  const [srAwbAssign, setSrAwbAssign]   = useState(false);
  const [srManifest, setSrManifest]     = useState(false);
  const [srCancelling, setSrCancelling] = useState(false);
  const [trackingData, setTrackingData] = useState(null);

  // Couriers modal
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [couriersLoading, setCouriersLoading]   = useState(false);
  const [couriersList, setCouriersList]         = useState([]);

  // Cancel confirmation modal
  const [showCancelModal, setShowCancelModal]   = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const d = await ordersAPI.getById(id);
      setOrder(d.order);
      setNewStatus(d.order.orderStatus);
      setTrackingId(d.order.trackingId || '');
    } catch (err) {
      console.error(err);
      toast.error('Failed to load order');
    }
  };

  useEffect(() => {
    fetchOrderDetails().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ── Shiprocket Handlers ─────────────────────────────────

  const handlePushToShiprocket = async () => {
    setSrPushing(true);
    try {
      const data = await shiprocketAPI.pushOrder(id);
      setOrder(data.order);
      setTrackingId(data.order.trackingId || '');
      toast.success('Shiprocket Order Created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create Shiprocket order');
    } finally { setSrPushing(false); }
  };

  const handleGetCouriers = async () => {
    setCouriersLoading(true);
    setShowCourierModal(true);
    setCouriersList([]);
    try {
      const data = await shiprocketAPI.getCouriers(id);
      setCouriersList(data.couriers || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch available couriers');
    } finally { setCouriersLoading(false); }
  };

  const handleAssignAWB = async (selectedCourierId = null) => {
    setSrAwbAssign(true);
    try {
      const data = await shiprocketAPI.assignAWB(id, { courierId: selectedCourierId });
      setOrder(data.order);
      setTrackingId(data.order?.trackingId || data.awbCode || '');
      setShowCourierModal(false);
      toast.success(`AWB Generated: ${data.awbCode} (${data.courierName || 'Courier'})`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate AWB');
    } finally { setSrAwbAssign(false); }
  };

  const handleSchedulePickup = async () => {
    setSrPickup(true);
    try {
      const data = await shiprocketAPI.schedulePickup(id);
      if (data.order) setOrder(data.order);
      toast.success('Pickup requested successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request pickup');
    } finally { setSrPickup(false); }
  };

  const handleGenerateLabel = async () => {
    setSrLabeling(true);
    try {
      const data = await shiprocketAPI.generateLabel(id);
      if (data.labelUrl) {
        window.open(data.labelUrl, '_blank');
        fetchOrderDetails();
        toast.success('Label ready!');
      } else {
        toast.error('No label URL returned');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download label');
    } finally { setSrLabeling(false); }
  };

  const handleGenerateManifest = async () => {
    setSrManifest(true);
    try {
      const data = await shiprocketAPI.generateManifest(id);
      if (data.manifestUrl) {
        window.open(data.manifestUrl, '_blank');
        fetchOrderDetails();
        toast.success('Manifest generated!');
      } else {
        toast.success('Manifest process initiated');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate manifest');
    } finally { setSrManifest(false); }
  };

  const handlePrintManifest = async () => {
    setSrManifest(true);
    try {
      const data = await shiprocketAPI.printManifest(id);
      if (data.manifestUrl) {
        window.open(data.manifestUrl, '_blank');
        fetchOrderDetails();
        toast.success('Manifest ready for download!');
      } else {
        toast.error('No manifest URL returned');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch manifest');
    } finally { setSrManifest(false); }
  };

  const handleCancelShipment = async () => {
    setSrCancelling(true);
    try {
      const data = await shiprocketAPI.cancelShipment(id);
      setOrder(data.order);
      setNewStatus('cancelled');
      setShowCancelModal(false);
      toast.success('Shipment cancelled successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel shipment');
    } finally { setSrCancelling(false); }
  };

  const handleTrackShipment = async () => {
    setSrTracking(true);
    setTrackingData(null);
    try {
      const data = await shiprocketAPI.trackOrder(id);
      setTrackingData(data.tracking);
      toast.success('Tracking data updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch tracking data');
    } finally { setSrTracking(false); }
  };

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>;
  if (!order) return <AdminLayout><p className="text-gray-500">Order not found</p></AdminLayout>;

  const sr = order.shiprocket || {};
  const hasSR = !!sr.orderId;
  const isCancelled = order.orderStatus === 'cancelled' || sr.status === 'CANCELLED';
  const isDelivered = order.orderStatus === 'delivered' || sr.status === 'Delivered';

  const getSRStatusBadge = (status) => {
    switch (status) {
      case 'CANCELLED': return <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-bold">Cancelled</span>;
      case 'Delivered': return <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold">Delivered</span>;
      case 'PICKUP_SCHEDULED': return <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-bold">Pickup Requested</span>;
      case 'AWB_ASSIGNED': return <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full font-bold">AWB Generated</span>;
      case 'NEW': return <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold">Created</span>;
      default: return <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-bold">{status || 'Created'}</span>;
    }
  };

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
        {/* Left — Items + Customer + Shiprocket */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Items Card */}
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
                      {item.variantName && (
                        <span className="text-xs bg-forest-50 text-forest-700 px-2 py-0.5 rounded font-bold mt-0.5 inline-block">
                          Variant: {item.variantName}
                        </span>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                    <p className="font-semibold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Card */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Customer</h3>
            {order.user ? (
              <>
                <p className="font-medium text-gray-800">{order.user.name}</p>
                <p className="text-sm text-gray-500">{order.user.email}</p>
                <span className="text-xs bg-forest-50 text-forest-700 px-2.5 py-0.5 rounded-full font-bold mt-2 inline-block">Registered Account</span>
              </>
            ) : (
              <>
                <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
                <p className="text-sm text-gray-500">{order.shippingAddress?.phone}</p>
                <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-bold mt-2 inline-block">Guest Checkout</span>
              </>
            )}
          </div>

          {/* ── Shiprocket Shipment Section ─────────────────── */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                <FiTruck className="text-blue-600" /> Shiprocket Shipment
              </h3>
              {hasSR && getSRStatusBadge(sr.status)}
            </div>

            {!hasSR ? (
              /* Create Order Action */
              <div className="text-center py-6 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-600 font-medium mb-1">No Shiprocket Order Created Yet</p>
                <p className="text-xs text-gray-400 mb-5">Click below to push this order details to Shiprocket</p>
                <button
                  onClick={handlePushToShiprocket}
                  disabled={srPushing || isCancelled}
                  className="btn-primary text-sm py-2.5 px-6 inline-flex items-center gap-2 shadow-sm"
                >
                  <FiSend /> {srPushing ? 'Creating Order...' : 'Create Shiprocket Order'}
                </button>
              </div>
            ) : (
              /* Full Shiprocket Details & Operations */
              <div className="space-y-5">
                {/* Information Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    <p className="text-gray-400 text-xs font-medium mb-0.5">Shiprocket Order ID</p>
                    <p className="font-bold text-gray-800 font-mono">#{sr.orderId}</p>
                  </div>
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    <p className="text-gray-400 text-xs font-medium mb-0.5">Shipment ID</p>
                    <p className="font-bold text-gray-800 font-mono">{sr.shipmentId || '—'}</p>
                  </div>
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    <p className="text-gray-400 text-xs font-medium mb-0.5">AWB Code</p>
                    <p className="font-bold text-gray-800 font-mono">{sr.awbCode || '—'}</p>
                  </div>
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    <p className="text-gray-400 text-xs font-medium mb-0.5">Courier Partner</p>
                    <p className="font-bold text-gray-800 truncate">{sr.courierName || 'Unassigned'}</p>
                  </div>
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    <p className="text-gray-400 text-xs font-medium mb-0.5">Pickup Status</p>
                    <p className="font-bold text-gray-800">{sr.pickupStatus || 'Not Requested'}</p>
                  </div>
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    <p className="text-gray-400 text-xs font-medium mb-0.5">Last Updated</p>
                    <p className="font-semibold text-gray-700 text-xs">
                      {sr.lastTrackedAt ? new Date(sr.lastTrackedAt).toLocaleString('en-IN') : (sr.pushedAt ? new Date(sr.pushedAt).toLocaleDateString('en-IN') : '—')}
                    </p>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Shipment Actions</p>
                  <div className="flex flex-wrap gap-2">
                    
                    {/* 1. Get Couriers & Assign AWB */}
                    {!sr.awbCode && !isCancelled && (
                      <>
                        <button
                          onClick={handleGetCouriers}
                          disabled={couriersLoading}
                          className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5 border-forest-200 text-forest-700 hover:bg-forest-50"
                        >
                          <FiTruck /> Get Couriers
                        </button>
                        <button
                          onClick={() => handleAssignAWB(null)}
                          disabled={srAwbAssign}
                          className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5 border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          <FiRefreshCw className={srAwbAssign ? 'animate-spin' : ''} />
                          {srAwbAssign ? 'Generating...' : 'Generate AWB'}
                        </button>
                      </>
                    )}

                    {/* 2. Request Pickup */}
                    {sr.awbCode && sr.pickupStatus !== 'Scheduled' && !isCancelled && !isDelivered && (
                      <button
                        onClick={handleSchedulePickup}
                        disabled={srPickup}
                        className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <FiTruck className={srPickup ? 'animate-spin' : ''} />
                        {srPickup ? 'Requesting...' : 'Request Pickup'}
                      </button>
                    )}

                    {/* 3. Download Label */}
                    {sr.shipmentId && !isCancelled && (
                      <button
                        onClick={handleGenerateLabel}
                        disabled={srLabeling}
                        className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        <FiDownload /> {srLabeling ? 'Loading...' : 'Download Label'}
                      </button>
                    )}

                    {/* 4. Generate & Print Manifest */}
                    {sr.shipmentId && !isCancelled && (
                      <>
                        <button
                          onClick={handleGenerateManifest}
                          disabled={srManifest}
                          className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                          <FiFileText /> Generate Manifest
                        </button>
                        <button
                          onClick={handlePrintManifest}
                          disabled={srManifest}
                          className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                          <FiDownload /> Download Manifest
                        </button>
                      </>
                    )}

                    {/* 5. Track Shipment */}
                    {sr.awbCode && (
                      <button
                        onClick={handleTrackShipment}
                        disabled={srTracking}
                        className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5 border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        <FiPackage className={srTracking ? 'animate-spin' : ''} />
                        {srTracking ? 'Tracking...' : 'Track Shipment'}
                      </button>
                    )}

                    {/* 6. Cancel Shipment */}
                    {!isCancelled && !isDelivered && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5 border-red-200 text-red-600 hover:bg-red-50 ml-auto"
                      >
                        <FiX /> Cancel Shipment
                      </button>
                    )}
                  </div>
                </div>

                {/* External links */}
                <div className="flex flex-wrap gap-3 pt-1 text-xs">
                  {sr.labelUrl && (
                    <a href={sr.labelUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold">
                      <FiExternalLink /> View Label PDF
                    </a>
                  )}
                  {sr.manifestUrl && (
                    <a href={sr.manifestUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold">
                      <FiExternalLink /> View Manifest PDF
                    </a>
                  )}
                </div>

                {/* Live Tracking Response Display */}
                {trackingData && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm max-h-72 overflow-y-auto">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <FiPackage className="text-forest-600" /> Live Tracking Status
                    </h4>
                    <pre className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-100 whitespace-pre-wrap break-words font-mono">
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
            <h3 className="font-semibold text-gray-800 mb-4">Update Order Status</h3>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field text-sm mb-3">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <input placeholder="Tracking ID (optional)" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} className="input-field text-sm mb-3" />
            <button onClick={handleUpdateStatus} disabled={saving} className="btn-primary w-full text-sm py-2.5 justify-center">
              <FiSave /> {saving ? 'Saving...' : 'Update Status'}
            </button>
          </div>

          {/* Payment Details */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Payment Details</h3>
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

          {/* Shipping Address */}
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

      {/* ── Courier Selection Modal ──────────────────────────── */}
      {showCourierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <FiTruck className="text-forest-600" /> Select Courier Partner
              </h3>
              <button onClick={() => setShowCourierModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto flex-1 space-y-3">
              {couriersLoading ? (
                <div className="text-center py-10">
                  <div className="w-8 h-8 border-4 border-forest-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Fetching available couriers from Shiprocket...</p>
                </div>
              ) : couriersList.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No couriers available or check serviceability failed.
                </div>
              ) : (
                couriersList.map((c) => (
                  <div key={c.courier_company_id} className="p-4 border border-gray-100 rounded-2xl hover:border-forest-300 hover:bg-forest-50/40 transition-all flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{c.courier_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Freight: <span className="font-semibold text-gray-700">₹{c.rate}</span> · Est. Delivery: <span className="font-semibold text-gray-700">{c.estimated_delivery_days} days</span>
                      </p>
                      {c.rating && <p className="text-[11px] text-amber-600 font-medium mt-0.5">Rating: ★ {c.rating}</p>}
                    </div>
                    <button
                      onClick={() => handleAssignAWB(c.courier_company_id)}
                      disabled={srAwbAssign}
                      className="btn-primary text-xs py-2 px-4"
                    >
                      {srAwbAssign ? 'Assigning...' : 'Select & Assign AWB'}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
              <button
                onClick={() => handleAssignAWB(null)}
                disabled={srAwbAssign}
                className="btn-outline text-xs text-purple-700 border-purple-200"
              >
                Auto-Assign Best Courier
              </button>
              <button onClick={() => setShowCourierModal(false)} className="btn-secondary text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Confirmation Modal ───────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              <FiAlertCircle />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Cancel Shipment?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to cancel this order on Shiprocket? This action will mark the shipment as cancelled and update the order status.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowCancelModal(false)}
                className="btn-secondary flex-1 text-sm py-2.5"
              >
                Nevermind
              </button>
              <button
                onClick={handleCancelShipment}
                disabled={srCancelling}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-2xl text-sm transition-all shadow-sm flex-1"
              >
                {srCancelling ? 'Cancelling...' : 'Yes, Cancel Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrderDetail;
