import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, paymentAPI, authAPI } from '../api/index';
import toast from 'react-hot-toast';
import { FiMapPin, FiCreditCard, FiLock, FiCheck, FiPlus } from 'react-icons/fi';
import { getImageUrl } from '../utils/imageHelper';
import MapPicker from '../components/MapPicker';

const Checkout = () => {
  const { cart, clearCart }   = useCart();
  const { user, updateUser }  = useAuth();
  const navigate              = useNavigate();
  const { state }             = useLocation();
  const [loading, setLoading] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [coords, setCoords]   = useState(null);
  const [form, setForm]       = useState({
    fullName: user?.name || '', phone: '', street: '', city: '', state: '', pincode: ''
  });

  const { subtotal = 0, tax = 0, shipping = 0, total = 0 } = state || {};

  // Auto-fill from saved addresses
  useEffect(() => {
    if (selectedAddressId && user?.addresses) {
      const addr = user.addresses.find(a => a._id === selectedAddressId);
      if (addr) {
        setForm({
          fullName: addr.fullName,
          phone: addr.phone,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode
        });
      }
    } else if (selectedAddressId === 'new') {
      setForm({ fullName: user?.name || '', phone: '', street: '', city: '', state: '', pincode: '' });
    }
  }, [selectedAddressId, user?.addresses]);

  useEffect(() => {
    if (form.pincode && form.pincode.length === 6 && selectedAddressId === 'new') {
      const fetchLocation = async () => {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${form.pincode}`);
          const data = await res.json();
          if (data && data[0].Status === 'Success') {
            const { District, State } = data[0].PostOffice[0];
            setForm(prev => ({ ...prev, city: District, state: State }));
          }
        } catch (err) {
          console.error('Pincode fetch error:', err);
        }
      };
      fetchLocation();
    }
  }, [form.pincode, selectedAddressId]);

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

      const shippingWithCoords = { ...form, location: coords };

      // Create order in DB
      const { order: dbOrder } = await ordersAPI.create({
        orderItems: cart.items.map((item) => ({
          product: item.product._id || item.product,
          name:    item.product.name || item.name,
          image:   item.product.images?.[0] || item.image || '',
          price:   item.price,
          quantity: item.quantity,
        })),
        shippingAddress: shippingWithCoords,
        paymentMethod:   'razorpay',
        itemsPrice:  subtotal,
        taxPrice:    tax,
        shippingPrice: shipping,
        totalPrice:  total,
      });

      // Save address if requested
      if (saveAddress && user && selectedAddressId === 'new') {
        try { 
          const { user: updatedUser } = await authAPI.addAddress(form);
          updateUser(updatedUser);
        } catch (err) { console.error('Failed to save address:', err); }
      }

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
        <h1 className="section-title mb-8 text-left">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} id="checkout-form" className="space-y-6">
              
              {/* Saved Addresses Section */}
              {user?.addresses?.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-display font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <FiCheck className="text-forest-500" /> Choose Saved Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {user.addresses.map((addr) => (
                      <div key={addr._id} onClick={() => setSelectedAddressId(addr._id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer hover:bg-forest-50 ${selectedAddressId === addr._id ? 'border-forest-500 bg-forest-50' : 'border-gray-100 bg-white'}`}>
                        <p className="font-bold text-gray-800 mb-1">{addr.fullName}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    ))}
                    <div onClick={() => setSelectedAddressId('new')}
                      className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all cursor-pointer hover:bg-gray-100 ${selectedAddressId === 'new' ? 'border-forest-500 bg-forest-50 text-forest-600' : 'border-gray-200 text-gray-400'}`}>
                      <FiPlus />
                      <span className="text-sm font-semibold">New Address</span>
                    </div>
                  </div>
                </div>
              )}

              {(!user?.addresses?.length || selectedAddressId === 'new') && (
                <div className="card p-6">
                  <h3 className="font-display font-bold text-lg text-gray-800 mb-5 flex items-center gap-2">
                    <FiMapPin className="text-forest-500" /> {user?.addresses?.length > 0 ? 'Enter New Address' : 'Shipping Address'}
                  </h3>
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

                  {user && (
                    <label className="flex items-center gap-2 mt-4 cursor-pointer">
                      <input type="checkbox" checked={saveAddress} onChange={() => setSaveAddress(!saveAddress)} className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500" />
                      <span className="text-sm text-gray-600 font-medium">Save this address for future use</span>
                    </label>
                  )}
                </div>
              )}

              {/* Map Section */}
              <div className="card p-6">
                <h3 className="font-display font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                  <FiMapPin className="text-forest-500" /> Precise Location
                </h3>
                <p className="text-sm text-gray-500 mb-4 italic">Tap the map to pin your exact house/building for faster delivery</p>
                <MapPicker onLocationSelect={setCoords} />
              </div>

              {/* Payment Method */}
              <div className="card p-6">
                <h3 className="font-display font-bold text-lg text-gray-800 mb-4 flex items-center gap-2"><FiCreditCard className="text-forest-500" /> Payment</h3>
                <div className="flex items-center gap-3 p-4 border-2 border-forest-500 rounded-xl bg-forest-50">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm p-1">
                    <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">Razorpay</p>
                    <p className="text-xs text-gray-500">UPI, Cards, Net Banking & Wallets</p>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-forest-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-forest-500" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base justify-center">
                <FiLock />
                {loading ? 'Processing...' : `Pay ₹${total.toFixed(2)} Securely`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 h-fit sticky top-24">
              <h3 className="font-display font-bold text-lg text-gray-800 mb-5">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {cart.items?.map((item) => {
                  const p = item.product || item;
                  const name = p.name || item.name;
                  const imgSrc = getImageUrl(p.images?.[0] || item.image);
                  return (
                    <div key={item._id || p._id} className="flex gap-3">
                      <div className="w-14 h-14 bg-forest-50 rounded-lg overflow-hidden flex-shrink-0">
                        {imgSrc ? <img src={imgSrc} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🌿</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-sm text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹{tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600 font-bold' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <FiLock /> 100% secure & encrypted checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
