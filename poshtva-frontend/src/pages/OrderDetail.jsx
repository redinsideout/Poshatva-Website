import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../api/index';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/LoadingSpinner';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { FiArrowLeft, FiMapPin, FiPackage, FiTruck, FiCheck, FiClock, FiInfo } from 'react-icons/fi';

import { getImageUrl } from '../utils/imageHelper';

const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed', icon: FiPackage },
  { key: 'processing', label: 'Processing',   icon: FiClock   },
  { key: 'shipped',    label: 'Shipped',      icon: FiTruck   },
  { key: 'delivered',  label: 'Delivered',    icon: FiCheck   },
];

const OrderDetail = () => {
  const { id }            = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user }          = useAuth();

  useEffect(() => {
    ordersAPI.getById(id)
      .then((d) => { setOrder(d.order); document.title = `Order #${d.order._id.slice(-8).toUpperCase()} — Poshatva`; })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pt-20"><PageLoader /></div>;
  if (!order)  return <div className="pt-20 text-center py-20"><p className="text-gray-500">Order not found</p></div>;

  const currentStep = STATUS_STEPS.findIndex((s) => s.key === order.orderStatus);

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="page-container py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link to={user ? "/profile" : "/"} className="p-2 rounded-xl hover:bg-gray-200 transition-colors"><FiArrowLeft /></Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="ml-auto"><OrderStatusBadge status={order.orderStatus} /></div>
        </div>

        {/* Tracking Timeline */}
        {order.orderStatus !== 'cancelled' && (
          <div className="card p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-6">Order Tracking</h3>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
              <div className="absolute top-5 left-0 h-0.5 bg-forest-500 transition-all" style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }} />
              {STATUS_STEPS.map((step, i) => {
                const done    = i <= currentStep;
                const current = i === currentStep;
                return (
                  <div key={step.key} className="relative flex flex-col items-center gap-2 z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${done ? 'bg-forest-500 text-white' : 'bg-gray-200 text-gray-400'} ${current ? 'ring-4 ring-forest-200' : ''}`}>
                      <step.icon className="text-sm" />
                    </div>
                    <span className={`text-xs font-medium ${done ? 'text-forest-600' : 'text-gray-400'}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Shiprocket shipment details */}
            <div className="mt-5 space-y-2">
              {order.trackingId && (
                <p className="text-sm text-gray-500">
                  Tracking ID: <span className="font-mono font-semibold text-gray-800">{order.trackingId}</span>
                </p>
              )}
              {order.shiprocket?.courierName && (
                <p className="text-sm text-gray-500">
                  Courier: <span className="font-semibold text-gray-800">{order.shiprocket.courierName}</span>
                </p>
              )}
              {order.shiprocket?.awbCode && (
                <a
                  href={`https://shiprocket.co/tracking/${order.shiprocket.awbCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-forest-50 text-forest-700 text-sm font-semibold rounded-xl hover:bg-forest-100 transition-colors"
                >
                  <FiTruck /> Track Shipment
                </a>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 card p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Items Ordered</h3>
            <div className="space-y-4">
              {order.orderItems?.map((item, i) => {
                const imgSrc = getImageUrl(item.image);
                return (
                  <div key={i} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-16 h-16 bg-forest-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {imgSrc ? <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-2xl">🌿</span>}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                      {item.variantName && (
                        <p className="text-xs text-forest-700 font-bold mt-0.5">Variant: {item.variantName}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary & Shipping */}
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Price Summary</h3>
              <div className="space-y-2 text-sm text-left">
                <div className="flex justify-between text-gray-600"><span>Items</span><span>₹{order.itemsPrice?.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹{order.taxPrice?.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span></div>
                {order.codCharge > 0 && (
                  <div className="flex justify-between text-gray-600"><span>COD Handling Fee</span><span>₹{order.codCharge.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span className="text-forest-700">₹{order.totalPrice?.toFixed(2)}</span></div>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FiInfo className="text-forest-500" /> Order Details</h3>
              <div className="text-sm text-gray-600 space-y-1.5 text-left">
                <div className="flex justify-between"><span>User Type</span><span className="font-medium text-gray-800">{order.userType || 'Registered'}</span></div>
                <div className="flex justify-between"><span>Payment Method</span><span className="font-medium text-gray-800">{order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment'}</span></div>
                <div className="flex justify-between"><span>Payment Status</span><span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-amber-600'}`}>{order.isPaid ? 'Paid' : 'Unpaid'}</span></div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FiMapPin className="text-forest-500" /> Shipping Address</h3>
              <div className="text-sm text-gray-600 space-y-0.5 text-left">
                <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p>{order.shippingAddress?.pincode}</p>
                <p className="mt-1">{order.shippingAddress?.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
