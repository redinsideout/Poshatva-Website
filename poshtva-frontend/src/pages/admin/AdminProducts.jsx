import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { productsAPI } from '../../api/products';
import { PageLoader } from '../../components/LoadingSpinner';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

import { getImageUrl } from '../../utils/imageHelper';

const AdminProducts = () => {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [deleting, setDeleting]   = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    productsAPI.getAll({ limit: 100 })
      .then((d) => setProducts(d.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { document.title = 'Products — Admin'; fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeleting(id);
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Delete failed');
    } finally { setDeleting(null); }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">{products.length} products total</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary text-sm py-2.5 px-4">
          <FiPlus /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 py-2.5 text-sm" />
      </div>

      {loading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => {
                  const imgSrc = getImageUrl(p.images?.[0]);
                  const effPrice = p.discountPrice > 0 ? p.discountPrice : p.price;
                  return (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-forest-50 rounded-xl overflow-hidden flex-shrink-0">
                            {imgSrc ? <img src={imgSrc} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 max-w-[200px] truncate">{p.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><span className="badge-green">{p.category?.name || '—'}</span></td>
                      <td className="px-5 py-4">
                        <div>
                          <span className="font-semibold text-forest-700">₹{effPrice}</span>
                          {p.discountPrice > 0 && <span className="text-xs text-gray-400 line-through ml-1">₹{p.price}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-medium ${p.stock === 0 ? 'text-red-500' : p.stock < 10 ? 'text-orange-500' : 'text-green-600'}`}>{p.stock}</span>
                      </td>
                      <td className="px-5 py-4">
                        {p.isFeatured ? <span className="badge-green">Yes</span> : <span className="badge-gray">No</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/admin/products/${p._id}/edit`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <FiEdit2 className="text-sm" />
                          </Link>
                          <button onClick={() => handleDelete(p._id)} disabled={deleting === p._id}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <FiTrash2 className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
