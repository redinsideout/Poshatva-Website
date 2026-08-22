import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../api/cart';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const GUEST_CART_KEY = 'poshatva_guest_cart';

const getGuestCart = () => {
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || { items: [], totalAmount: 0 }; }
  catch { return { items: [], totalAmount: 0 }; }
};

const saveGuestCart = (cart) => localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));

const calcGuestTotal = (items) => items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart]             = useState({ items: [], totalAmount: 0 });
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(getGuestCart());
      return;
    }
    try {
      setCartLoading(true);
      const data = await cartAPI.getCart();
      setCart(data.cart);
    } catch (err) {
      console.error('Cart fetch error:', err);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // When user logs in, merge guest cart into server cart
  useEffect(() => {
    if (!user) return;
    const guest = getGuestCart();
    if (!guest.items.length) return;
    (async () => {
      for (const item of guest.items) {
        try {
          await cartAPI.addToCart({
            productId: item.product._id || item.product,
            variantId: item.variantId || '',
            quantity: item.quantity,
          });
        } catch { /* skip if error */ }
      }
      localStorage.removeItem(GUEST_CART_KEY);
      fetchCart();
    })();
  }, [user]); // eslint-disable-line

  const addToCart = async (productId, quantity = 1, productData = null, variantId = '') => {
    // Resolve variant details from productData if passed
    let selectedPrice = productData?.discountPrice > 0 ? productData.discountPrice : productData?.price || 0;
    let selectedMrp = productData?.price || 0;
    let selectedVariantName = '';
    let selectedWeight = productData?.weightInKg || 0.5;
    let actualVariantId = variantId || '';

    if (productData?.variants?.length > 0) {
      const matchVar = variantId
        ? (productData.variants.find(v => v._id === variantId || v._id?.toString() === variantId))
        : productData.variants.find(v => v.isActive !== false);

      if (matchVar) {
        selectedPrice = matchVar.discountPrice > 0 ? matchVar.discountPrice : matchVar.price;
        selectedMrp = matchVar.price;
        selectedVariantName = matchVar.name;
        selectedWeight = matchVar.weightInKg || 0.5;
        actualVariantId = matchVar._id?.toString() || variantId;
      }
    }

    if (!user) {
      // Guest mode — store in localStorage
      const guest = getGuestCart();
      const existingIdx = guest.items.findIndex(
        (i) => (i.product._id || i.product) === productId && (i.variantId || '') === actualVariantId
      );

      let updatedItems;
      if (existingIdx >= 0) {
        updatedItems = guest.items.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + quantity, price: selectedPrice } : item
        );
      } else {
        const newItem = {
          product: productData ? productData : { _id: productId },
          variantId: actualVariantId,
          variantName: selectedVariantName,
          mrp: selectedMrp,
          weightInKg: selectedWeight,
          quantity,
          price: selectedPrice,
        };
        updatedItems = [...guest.items, newItem];
      }
      const updated = { items: updatedItems, totalAmount: calcGuestTotal(updatedItems) };
      saveGuestCart(updated);
      setCart(updated);
      toast.success(`Added ${productData?.name || 'product'} ${selectedVariantName ? `(${selectedVariantName})` : ''} to basket! 🌿`);
      return true;
    }

    try {
      const data = await cartAPI.addToCart({ productId, variantId: actualVariantId, quantity });
      setCart(data.cart);
      toast.success(`Added to basket! 🌿`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  };

  const removeFromCart = async (productId, variantId = '') => {
    if (!user) {
      const guest = getGuestCart();
      const updatedItems = guest.items.filter((i) => {
        const pMatch = (i.product._id || i.product) === productId;
        const vMatch = (i.variantId || '') === (variantId || '');
        return !(pMatch && vMatch);
      });
      const updated = { items: updatedItems, totalAmount: calcGuestTotal(updatedItems) };
      saveGuestCart(updated);
      setCart(updated);
      toast.success('Item removed');
      return;
    }
    try {
      const data = await cartAPI.removeFromCart(productId, variantId);
      setCart(data.cart);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (productId, quantity, variantId = '') => {
    if (quantity < 1) { removeFromCart(productId, variantId); return; }
    if (!user) {
      const guest = getGuestCart();
      const updatedItems = guest.items.map((i) => {
        const pMatch = (i.product._id || i.product) === productId;
        const vMatch = (i.variantId || '') === (variantId || '');
        return (pMatch && vMatch) ? { ...i, quantity } : i;
      });
      const updated = { items: updatedItems, totalAmount: calcGuestTotal(updatedItems) };
      saveGuestCart(updated);
      setCart(updated);
      return;
    }
    try {
      const data = await cartAPI.addToCart({ productId, variantId, quantity });
      setCart(data.cart);
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    if (!user) {
      localStorage.removeItem(GUEST_CART_KEY);
      setCart({ items: [], totalAmount: 0 });
      return;
    }
    try {
      await cartAPI.clearCart();
      setCart({ items: [], totalAmount: 0 });
    } catch (err) {
      console.error('Clear cart error:', err);
    }
  };

  const cartCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, cartLoading, cartCount, addToCart, removeFromCart, updateQuantity, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;
