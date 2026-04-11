import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminAPI } from '../../api/index';
import { PageLoader } from '../../components/LoadingSpinner';


const AdminUsers = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Users — Admin';
    adminAPI.getUsers()
      .then((d) => setUsers(d.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 text-sm">{users.length} registered users</p>
      </div>
      {loading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Email', 'Role', 'Phone', 'Joined'].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-forest-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{u.email}</td>
                    <td className="px-5 py-4">
                      {u.role === 'admin' ? <span className="badge-green">Admin</span> : <span className="badge-gray">User</span>}
                    </td>
                    <td className="px-5 py-4 text-gray-500">{u.phone || '—'}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
