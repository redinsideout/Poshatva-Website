import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { PageLoader } from '../components/LoadingSpinner';
import { productsAPI, categoriesAPI } from '../api/index';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First'   },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated'      },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [total, setTotal]               = useState(0);
  const [pages, setPages]               = useState(1);
  const [showFilters, setShowFilters]   = useState(false);

  const page     = Number(searchParams.get('page')     || 1);
  const category = searchParams.get('category')        || '';
  const minPrice = searchParams.get('minPrice')        || '';
  const maxPrice = searchParams.get('maxPrice')        || '';
  const search   = searchParams.get('search')          || '';
  const sort     = searchParams.get('sort')            || 'newest';

  useEffect(() => {
    document.title = 'Products — Poshatva';
    categoriesAPI.getAll().then((d) => setCategories(d.categories || [])).catch(console.error);
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 12, sort };
    if (category) params.search = category;
    if (search)   params.search = search;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    productsAPI.getAll(params)
      .then((data) => { setProducts(data.products || []); setTotal(data.total || 0); setPages(data.pages || 1); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, category, search, minPrice, maxPrice, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const clearFilters = () => setSearchParams({});

  const hasFilters = category || minPrice || maxPrice || search;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="page-container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title">Our Products</h1>
            <p className="text-gray-500 mt-1">{total} products found {search && `for "${search}"`}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search products..." defaultValue={search}
                onKeyDown={(e) => { if (e.key === 'Enter') updateParam('search', e.target.value); }}
                onChange={(e) => { if (!e.target.value) updateParam('search', ''); }}
                className="input-field pl-9 py-2.5 text-sm" />
            </div>
            {/* Sort */}
            <div className="relative">
              <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}
                className="input-field py-2.5 text-sm pr-8 appearance-none cursor-pointer">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {/* Mobile Filter Toggle */}
            <button onClick={() => setShowFilters(!showFilters)}
              className="md:hidden btn-outline py-2.5 gap-2">
              <FiFilter /> Filters {hasFilters && <span className="w-2 h-2 bg-forest-500 rounded-full" />}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="card p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-gray-800">Filters</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <FiX /> Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Categories</h4>
                <div className="space-y-1">
                  <button onClick={() => updateParam('category', '')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!category ? 'bg-forest-100 text-forest-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button key={cat._id} onClick={() => updateParam('category', cat.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${category === cat.name ? 'bg-forest-100 text-forest-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h4>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" defaultValue={minPrice}
                    onBlur={(e) => updateParam('minPrice', e.target.value)}
                    className="input-field py-2 text-sm text-center" />
                  <input type="number" placeholder="Max" defaultValue={maxPrice}
                    onBlur={(e) => updateParam('maxPrice', e.target.value)}
                    className="input-field py-2 text-sm text-center" />
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <PageLoader />
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🌿</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="btn-primary mt-6">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((p, i) => (
                    <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {[...Array(pages)].map((_, i) => (
                      <button key={i} onClick={() => updateParam('page', String(i + 1))}
                        className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${page === i + 1 ? 'bg-forest-500 text-white shadow-glow' : 'bg-white text-gray-700 hover:bg-forest-50 border border-gray-200'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
