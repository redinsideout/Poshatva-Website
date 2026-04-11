import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { ordersAPI } from '../../api/index';
import { PageLoader } from '../../components/LoadingSpinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { FiSearch, FiChevronDown } from 'react-icons/fi';

const STATUS_OPTIONS = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');

  const fetchOrders = () => {
    setLoading(true);
    const params = { limit: 100 };
    if (status) params.status = status;
    ordersAPI.getAllOrders(params)
      .then((d) => setOrders(d.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { document.title = 'Orders — Admin'; fetchOrders(); }, [status]);

  const filtered = orders.filter((o) =>
    o._id.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm">{orders.length} orders total</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by ID or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 py-2.5 text-sm" />
        </div>
        <div className="relative">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field py-2.5 text-sm pr-8 appearance-none">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-gray-600">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">{order.user?.name}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[150px]">{order.user?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{order.orderItems?.length}</td>
                    <td className="px-5 py-4 font-semibold text-forest-700">₹{order.totalPrice?.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      {order.isPaid ? <span className="badge-green">Paid</span> : <span className="badge-red">Unpaid</span>}
                    </td>
                    <td className="px-5 py-4"><OrderStatusBadge status={order.orderStatus} /></td>
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/admin/orders/${order._id}`} className="text-forest-600 hover:text-forest-700 font-medium text-xs">View →</Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
