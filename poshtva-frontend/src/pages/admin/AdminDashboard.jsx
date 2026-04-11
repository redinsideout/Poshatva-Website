import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminAPI } from '../../api/index';
import { PageLoader } from '../../components/LoadingSpinner';
import { FiTrendingUp, FiPackage, FiUsers, FiDollarSign, FiShoppingBag } from 'react-icons/fi';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, title, value, color, sub }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
        <Icon className="text-xl text-white" />
      </div>
    </div>
    <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
    <p className="text-gray-500 text-sm mt-1">{title}</p>
    {sub && <p className="text-xs text-green-500 mt-1">{sub}</p>}
  </div>
);

const AdminDashboard = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Admin Dashboard — Poshatva';
    adminAPI.getDashboard()
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>;

  const { stats, recentOrders = [], salesByMonth = [], ordersByStatus = [] } = data || {};

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={FiDollarSign} title="Total Revenue"  value={`₹${(stats?.totalRevenue || 0).toFixed(0)}`} color="bg-forest-500" sub="From paid orders" />
        <StatCard icon={FiPackage}    title="Total Orders"   value={stats?.totalOrders || 0}   color="bg-blue-500"   />
        <StatCard icon={FiUsers}      title="Total Users"    value={stats?.totalUsers || 0}    color="bg-purple-500" />
        <StatCard icon={FiShoppingBag}title="Active Products"value={stats?.totalProducts || 0} color="bg-earth-500"  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-gray-800">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm text-forest-600 hover:text-forest-700 font-medium">View All →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link key={order._id} to={`/admin/orders/${order._id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiPackage className="text-forest-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 truncate">{order.user?.name} · {order.user?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-gray-800">₹{order.totalPrice?.toFixed(2)}</p>
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-gray-800 mb-5">Orders by Status</h3>
          {ordersByStatus.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {ordersByStatus.map((s) => (
                <div key={s._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={s._id} />
                  </div>
                  <span className="font-bold text-gray-700">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
