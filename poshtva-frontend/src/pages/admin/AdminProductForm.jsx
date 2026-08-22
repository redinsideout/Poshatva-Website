import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { productsAPI } from '../../api/products';
import { categoriesAPI, uploadAPI } from '../../api/index';
import { PageLoader } from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiSave, FiArrowLeft, FiPlus, FiTrash2, FiLayers } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const initialForm = {
  name: '', slug: '', description: '', richDescription: '', category: '',
  price: '', discountPrice: '', stock: '', weight: '', unit: 'kg',
  variants: [],
  tags: '', isFeatured: false, isActive: true, benefits: '', howToUse: '', images: [],
};

const AdminProductForm = () => {
  const { id }              = useParams();
  const isEdit              = Boolean(id);
  const navigate            = useNavigate();
  const [form, setForm]     = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(isEdit);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    document.title = `${isEdit ? 'Edit' : 'Add'} Product — Admin`;
    categoriesAPI.getAll().then((d) => setCategories(d.categories || [])).catch(console.error);
    if (isEdit) {
      productsAPI.getById(id)
        .then((d) => {
          const p = d.product;
          setForm({
            name: p.name, slug: p.slug, description: p.description, richDescription: p.richDescription || '',
            category: p.category?._id || '', price: p.price, discountPrice: p.discountPrice || '',
            stock: p.stock, weight: p.weight || '', unit: p.unit || 'kg',
            variants: p.variants || [],
            tags: p.tags?.join(', ') || '', isFeatured: p.isFeatured, isActive: p.isActive,
            benefits: p.benefits?.join('\n') || '', howToUse: p.howToUse || '', images: p.images || [],
          });
        })
        .catch(() => toast.error('Failed to load product'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm({ ...form, name, slug: !isEdit ? autoSlug(name) : form.slug });
  };

  // ── Variant Management Handlers ─────────────────────────
  const handleAddVariant = () => {
    const newVariant = {
      name: '1 KG',
      value: 1,
      unit: 'kg',
      price: Number(form.price) || 299,
      discountPrice: Number(form.discountPrice) || 249,
      stock: Number(form.stock) || 50,
      weightInKg: 1,
      sku: '',
      isActive: true,
    };
    setForm({ ...form, variants: [...form.variants, newVariant] });
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = form.variants.map((v, i) => {
      if (i === index) {
        return { ...v, [field]: value };
      }
      return v;
    });
    setForm({ ...form, variants: updatedVariants });
  };

  const handleRemoveVariant = (index) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) });
  };

  // ── Image Upload ────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const MAX_SIZE_MB = 5;
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" is not a supported image type. Use JPG, PNG, or WEBP.`);
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the ${MAX_SIZE_MB}MB size limit.`);
        return;
      }
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      const data = await uploadAPI.uploadImages(formData);
      setForm((prev) => ({ ...prev, images: [...prev.images, ...data.urls] }));
      toast.success(`${data.urls.length} image(s) uploaded successfully!`);
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message || 'Unknown error';
      toast.error(`Image upload failed: ${serverMsg}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.category || !form.price || !form.stock) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    const formattedVariants = form.variants.map((v) => ({
      ...v,
      price: Number(v.price) || 0,
      discountPrice: Number(v.discountPrice) || 0,
      stock: Number(v.stock) || 0,
      weightInKg: Number(v.weightInKg) || 0.5,
    }));

    const payload = {
      ...form,
      price:        Number(form.price),
      discountPrice:Number(form.discountPrice) || 0,
      stock:        Number(form.stock),
      variants:     formattedVariants,
      tags:         typeof form.tags === 'string' ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : (Array.isArray(form.tags) ? form.tags : []),
      benefits:     typeof form.benefits === 'string' ? form.benefits.split('\n').map((b) => b.trim()).filter(Boolean) : (Array.isArray(form.benefits) ? form.benefits : []),
    };

    try {
      if (isEdit) {
        await productsAPI.update(id, payload);
        toast.success('Product updated!');
      } else {
        await productsAPI.create(payload);
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/products')} className="p-2 rounded-xl hover:bg-gray-200 transition-colors"><FiArrowLeft /></button>
        <h1 className="text-2xl font-display font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Basic Information</h3>
            <div>
              <label className="label">Product Name *</label>
              <input name="name" value={form.name} onChange={handleNameChange} required className="input-field" placeholder="e.g. Premium Cocopeat Block" />
            </div>
            <div>
              <label className="label">Slug *</label>
              <input name="slug" value={form.slug} onChange={handleChange} required className="input-field font-mono text-sm" placeholder="product-slug" />
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="input-field resize-none" placeholder="Short product description" />
            </div>
            <div>
              <label className="label">Rich Description</label>
              <textarea name="richDescription" value={form.richDescription} onChange={handleChange} rows={4} className="input-field resize-none" placeholder="Detailed product description" />
            </div>
            <div>
              <label className="label">Benefits (one per line)</label>
              <textarea name="benefits" value={form.benefits} onChange={handleChange} rows={4} className="input-field resize-none font-mono text-sm" placeholder="Retains moisture up to 8x&#10;pH neutral&#10;Eco-friendly" />
            </div>
            <div>
              <label className="label">How to Use</label>
              <textarea name="howToUse" value={form.howToUse} onChange={handleChange} rows={2} className="input-field resize-none" placeholder="Usage instructions" />
            </div>
            <div>
              <label className="label">Tags (comma-separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange} className="input-field" placeholder="cocopeat, organic, growing medium" />
            </div>
          </div>

          {/* ── Product Variants Section ───────────────────── */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FiLayers className="text-forest-600" /> Product Variants & Dynamic Pricing
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Add weights/sizes (e.g. 1 KG, 5 KG, 10 KG) with custom prices and stock.</p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="btn-primary text-xs py-2 px-3 inline-flex items-center gap-1.5"
              >
                <FiPlus /> Add Variant
              </button>
            </div>

            {form.variants.length === 0 ? (
              <div className="text-center py-6 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500 mb-2">No variants added yet.</p>
                <p className="text-xs text-gray-400">The product will use the single default price configured on the right sidebar.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {form.variants.map((variant, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-2xl bg-gray-50/50 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-forest-800 uppercase tracking-wider">
                        Variant #{index + 1}: {variant.name || 'Unnamed'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors text-xs inline-flex items-center gap-1"
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="label text-[11px]">Variant Name / Size *</label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                          placeholder="e.g. 5 KG"
                          required
                          className="input-field text-xs py-2"
                        />
                      </div>
                      <div>
                        <label className="label text-[11px]">MRP (Base Price ₹) *</label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                          placeholder="999"
                          required
                          min="0"
                          className="input-field text-xs py-2"
                        />
                      </div>
                      <div>
                        <label className="label text-[11px]">Selling Price (₹)</label>
                        <input
                          type="number"
                          value={variant.discountPrice}
                          onChange={(e) => handleVariantChange(index, 'discountPrice', e.target.value)}
                          placeholder="899"
                          min="0"
                          className="input-field text-xs py-2"
                        />
                      </div>
                      <div>
                        <label className="label text-[11px]">Stock *</label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                          placeholder="20"
                          required
                          min="0"
                          className="input-field text-xs py-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="label text-[11px]">Weight in KG (Shiprocket)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={variant.weightInKg || 0.5}
                          onChange={(e) => handleVariantChange(index, 'weightInKg', e.target.value)}
                          placeholder="5"
                          className="input-field text-xs py-2"
                        />
                      </div>
                      <div>
                        <label className="label text-[11px]">SKU (Optional)</label>
                        <input
                          type="text"
                          value={variant.sku || ''}
                          onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                          placeholder="COCO-5KG"
                          className="input-field text-xs py-2"
                        />
                      </div>
                      <div className="col-span-2 flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                          <input
                            type="checkbox"
                            checked={variant.isActive !== false}
                            onChange={(e) => handleVariantChange(index, 'isActive', e.target.checked)}
                            className="rounded text-forest-600 focus:ring-forest-500 w-4 h-4"
                          />
                          Active (Visible for purchase)
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Product Images</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
              {form.images.map((url, i) => {
                const imgSrc = url.startsWith('http') ? url : `${API_URL}${url}`;
                return (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                    <img src={imgSrc} alt={`Product preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FiX />
                    </button>
                  </div>
                );
              })}
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-forest-400 flex flex-col items-center justify-center cursor-pointer transition-colors">
                <FiUpload className="text-gray-400 text-xl mb-1" />
                <span className="text-xs text-gray-400">Upload</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            {uploading && <p className="text-sm text-forest-600 animate-pulse">Uploading images...</p>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Base Pricing & Stock (Fallback)</h3>
            <div>
              <label className="label">Default Price (₹) *</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} required min="0" className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="label">Default Discount Price (₹)</label>
              <input name="discountPrice" type="number" value={form.discountPrice} onChange={handleChange} min="0" className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="label">Default Stock *</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} required min="0" className="input-field" placeholder="0" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Default Weight</label>
                <input name="weight" value={form.weight} onChange={handleChange} className="input-field" placeholder="1" />
              </div>
              <div>
                <label className="label">Unit</label>
                <select name="unit" value={form.unit} onChange={handleChange} className="input-field">
                  {['kg', 'g', 'L', 'ml', 'units'].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Category</h3>
            <select name="category" value={form.category} onChange={handleChange} required className="input-field">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="card p-6 space-y-3">
            <h3 className="font-semibold text-gray-800">Settings</h3>
            {[
              { name: 'isFeatured', label: 'Featured Product' },
              { name: 'isActive',   label: 'Active (visible)' },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center gap-3 cursor-pointer">
                <div className={`w-11 h-6 rounded-full transition-colors relative ${form[name] ? 'bg-forest-500' : 'bg-gray-200'}`} onClick={() => setForm({ ...form, [name]: !form[name] })}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form[name] ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`} />
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-4 justify-center text-base">
            <FiSave /> {saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminProductForm;
