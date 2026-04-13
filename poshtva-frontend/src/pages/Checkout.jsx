import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, paymentAPI, authAPI } from '../api/index';
import toast from 'react-hot-toast';
import { FiMapPin, FiCreditCard, FiLock, FiCheck, FiPlus, FiHome, FiBriefcase } from 'react-icons/fi';
import { getImageUrl } from '../utils/imageHelper';

const Checkout = () => {
  const { cart, clearCart }   = useCart();
  const { user, updateUser }  = useAuth();
  const navigate              = useNavigate();
  const { state }             = useLocation();
  const [loading, setLoading] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [form, setForm]       = useState({
    fullName: user?.name || '', phone: '', street: '', city: '', state: '', pincode: '', label: 'Home'
  });
  const [pincodeLoading, setPincodeLoading] = useState(false);

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
          pincode: addr.pincode,
          label: addr.label || 'Other'
        });
      }
    } else if (selectedAddressId === 'new') {
      setForm({ fullName: user?.name || '', phone: '', street: '', city: '', state: '', pincode: '', label: 'Home' });
    }
  }, [selectedAddressId, user?.addresses, user?.name]);

  useEffect(() => {
    const isNewAddressMode = !selectedAddressId || selectedAddressId === 'new';
    
    // Clear city/state if pincode is removed or too short
    if (isNewAddressMode && (!form.pincode || form.pincode.length < 6)) {
      if (form.city || form.state) {
        setForm(prev => ({ ...prev, city: '', state: '' }));
      }
      return;
    }

    if (form.pincode && form.pincode.length === 6 && isNewAddressMode) {
      const fetchLocation = async () => {
        setPincodeLoading(true);
        try {
          // Primary API: Indian Post (Best for Districts)
          const res = await fetch(`https://api.postalpincode.in/pincode/${form.pincode}`);
          const data = await res.json();
          
          if (data && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            setForm(prev => ({ 
              ...prev, 
              city: postOffice.District || postOffice.Block || '', 
              state: postOffice.State || '' 
            }));
          } else {
            // Fallback API if Indian Post is slow/down
            const fallbackRes = await fetch(`https://api.zippopotam.us/IN/${form.pincode}`);
            const fallbackData = await fallbackRes.json();
            if (fallbackData && fallbackData.places) {
              setForm(prev => ({ 
                ...prev, 
                city: fallbackData.places[0]['place name'] || '', 
                state: fallbackData.places[0].state || '' 
              }));
            }
          }
        } catch (err) {
          console.error('Pincode fetch error:', err);
        } finally {
          setPincodeLoading(false);
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

      const shippingWithCoords = { ...form };

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

  const getLabelIcon = (label) => {
    switch (label) {
      case 'Home': return <FiHome />;
      case 'Work': return <FiBriefcase />;
      default: return <FiMapPin />;
    }
  };

  return (
    <div className="pt-32 min-h-screen bg-gray-50">
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
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group relative overflow-hidden ${selectedAddressId === addr._id ? 'border-forest-500 bg-forest-50 shadow-md' : 'border-gray-100 bg-white hover:border-forest-200'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className={`p-2 rounded-lg ${selectedAddressId === addr._id ? 'bg-forest-500 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-forest-100 group-hover:text-forest-600'}`}>
                            {getLabelIcon(addr.label)}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${selectedAddressId === addr._id ? 'bg-forest-200 text-forest-800' : 'bg-gray-100 text-gray-500'}`}>
                            {addr.label || 'Other'}
                          </span>
                        </div>
                        <p className="font-bold text-gray-800 mb-0.5 truncate">{addr.fullName}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{addr.street}, {addr.city}</p>
                        {selectedAddressId === addr._id && (
                          <div className="absolute bottom-1 right-2">
                            <FiCheck className="text-forest-600" />
                          </div>
                        )}
                      </div>
                    ))}
                    <div onClick={() => setSelectedAddressId('new')}
                      className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all cursor-pointer hover:bg-forest-50 hover:border-forest-300 ${selectedAddressId === 'new' ? 'border-forest-500 bg-forest-50 text-forest-600' : 'border-gray-200 text-gray-400'}`}>
                      <FiPlus className="text-lg" />
                      <span className="text-sm font-semibold">New Address</span>
                    </div>
                  </div>
                </div>
              )}

              {(!user?.addresses?.length || selectedAddressId === 'new') && (
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-bold text-lg text-gray-800 flex items-center gap-2">
                      <FiMapPin className="text-forest-500" /> {user?.addresses?.length > 0 ? 'Enter New Address' : 'Shipping Address'}
                    </h3>
                    
                    {user && (
                      <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                        {['Home', 'Work', 'Other'].map((label) => (
                          <button key={label} type="button" onClick={() => setForm({ ...form, label })}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${form.label === label ? 'bg-white text-forest-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

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
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-tight">{label} *</label>
                          {(name === 'city' || name === 'state') && (
                            <>
                              {pincodeLoading && (
                                <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-1.5 rounded animate-pulse">Fetching...</span>
                              )}
                              {!pincodeLoading && form[name] && form.pincode?.length === 6 && (
                                <span className="text-[10px] text-forest-600 font-bold bg-forest-50 px-1.5 rounded shadow-sm flex items-center gap-1">
                                  <FiCheck className="text-[8px]" /> Auto-filled
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <input name={name} type={type} value={form[name]} onChange={handleChange} required placeholder={placeholder} className="input-field" />
                      </div>
                    ))}
                  </div>

                  {user && (
                    <label className="flex items-center gap-2 mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-forest-50 transition-colors group">
                      <input type="checkbox" checked={saveAddress} onChange={() => setSaveAddress(!saveAddress)} className="w-5 h-5 rounded-lg border-gray-300 text-forest-600 focus:ring-forest-500 transition-all" />
                      <div>
                        <p className="text-sm font-bold text-gray-800">Save address as {form.label}</p>
                        <p className="text-xs text-gray-500">Enable faster checkout for your next purchase</p>
                      </div>
                    </label>
                  )}
                </div>
              )}

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
