import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, paymentAPI } from '../api/index';
import toast from 'react-hot-toast';
import { FiMapPin, FiCreditCard, FiLock } from 'react-icons/fi';

const Checkout = () => {
  const { cart, clearCart }   = useCart();
  const { user }              = useAuth();
  const navigate              = useNavigate();
  const { state }             = useLocation();
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    fullName: user?.name || '', phone: '', street: '', city: '', state: '', pincode: ''
  });

  const { subtotal = 0, tax = 0, shipping = 0, total = 0 } = state || {};

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart.items?.length) { toast.error('Cart is empty'); return; }

    setLoading(true);
    try {
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) { toast.error('Payment gateway failed to load'); setLoading(false); return; }

      // Create order in DB
      const { order: dbOrder } = await ordersAPI.create({
        orderItems: cart.items.map((item) => ({
          product: item.product._id,
          name:    item.product.name,
          image:   item.product.images?.[0] || '',
          price:   item.price,
          quantity: item.quantity,
        })),
        shippingAddress: form,
        paymentMethod:   'razorpay',
        itemsPrice:  subtotal,
        taxPrice:    tax,
        shippingPrice: shipping,
        totalPrice:  total,
      });

      // Create Razorpay order
      const { order: rzpOrder, key } = await paymentAPI.createOrder({
        amount:  total,
        receipt: dbOrder._id,
      });

      const options = {
        key,
        amount:   rzpOrder.amount,
        currency: rzpOrder.currency,
        name:     'Poshatva',
        description: 'Organic Plant Products',
        order_id: rzpOrder.id,
        handler: async (response) => {
          try {
            await paymentAPI.verify(response);
            await ordersAPI.markPaid(dbOrder._id, response);
            await clearCart();
            navigate('/order-success', { state: { orderId: dbOrder._id } });
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: form.fullName, contact: form.phone, email: user?.email },
        theme:   { color: '#2d6a4f' },
        modal:   { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="page-container py-10">
        <h1 className="section-title mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Shipping Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-gray-800 mb-5 flex items-center gap-2"><FiMapPin className="text-forest-500" /> Shipping Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'fullName', label: 'Full Name',    placeholder: 'Your full name', col: 'sm:col-span-2' },
                  { name: 'phone',    label: 'Phone Number', placeholder: '10-digit mobile', type: 'tel'         },
                  { name: 'pincode',  label: 'PIN Code',     placeholder: '6-digit pincode', type: 'number'      },
                  { name: 'street',   label: 'Street Address', placeholder: 'House no, street, area', col: 'sm:col-span-2' },
                  { name: 'city',     label: 'City',           placeholder: 'City'                                },
                  { name: 'state',    label: 'State',          placeholder: 'State'                               },
                ].map(({ name, label, placeholder, col = '', type = 'text' }) => (
                  <div key={name} className={col}>
                    <label className="label">{label} *</label>
                    <input name={name} type={type} value={form[name]} onChange={handleChange} required placeholder={placeholder} className="input-field" />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg text-gray-800 mb-4 flex items-center gap-2"><FiCreditCard className="text-forest-500" /> Payment</h3>
              <div className="flex items-center gap-3 p-4 border-2 border-forest-500 rounded-xl bg-forest-50">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm p-1">
                  <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Razorpay</p>
                  <p className="text-xs text-gray-500">UPI, Cards, Net Banking & Wallets</p>
                </div>
                <div className="ml-auto w-4 h-4 rounded-full border-2 border-forest-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-forest-500" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base justify-center">
              <FiLock />
              {loading ? 'Processing...' : `Pay ₹${total.toFixed(2)} Securely`}
            </button>
          </form>

          {/* Order Summary */}
          <div className="card p-6 h-fit sticky top-24">
            <h3 className="font-display font-bold text-lg text-gray-800 mb-5">Order Summary</h3>
            <div className="space-y-3 mb-5">
              {cart.items?.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate max-w-[60%]">{item.product?.name} ×{item.quantity}</span>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹{tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <FiLock /> 100% secure & encrypted checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
