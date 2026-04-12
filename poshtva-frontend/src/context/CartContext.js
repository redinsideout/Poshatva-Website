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
        try { await cartAPI.addToCart({ productId: item.product._id || item.product, quantity: item.quantity }); }
        catch { /* skip if already there */ }
      }
      localStorage.removeItem(GUEST_CART_KEY);
      fetchCart();
    })();
  }, [user]); // eslint-disable-line

  const addToCart = async (productId, quantity = 1, productData = null) => {
    if (!user) {
      // Guest mode — store in localStorage
      const guest = getGuestCart();
      const existing = guest.items.findIndex((i) => (i.product._id || i.product) === productId);
      let updatedItems;
      if (existing >= 0) {
        updatedItems = guest.items.map((item, idx) =>
          idx === existing ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        const newItem = {
          product: productData ? productData : { _id: productId },
          quantity,
          price: productData?.discountPrice > 0 ? productData.discountPrice : productData?.price || 0,
        };
        updatedItems = [...guest.items, newItem];
      }
      const updated = { items: updatedItems, totalAmount: calcGuestTotal(updatedItems) };
      saveGuestCart(updated);
      setCart(updated);
      toast.success('Added to cart! 🌿');
      return true;
    }
    try {
      const data = await cartAPI.addToCart({ productId, quantity });
      setCart(data.cart);
      toast.success('Added to cart!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) {
      const guest = getGuestCart();
      const updatedItems = guest.items.filter((i) => (i.product._id || i.product) !== productId);
      const updated = { items: updatedItems, totalAmount: calcGuestTotal(updatedItems) };
      saveGuestCart(updated);
      setCart(updated);
      toast.success('Item removed');
      return;
    }
    try {
      const data = await cartAPI.removeFromCart(productId);
      setCart(data.cart);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) { removeFromCart(productId); return; }
    if (!user) {
      const guest = getGuestCart();
      const updatedItems = guest.items.map((i) =>
        (i.product._id || i.product) === productId ? { ...i, quantity } : i
      );
      const updated = { items: updatedItems, totalAmount: calcGuestTotal(updatedItems) };
      saveGuestCart(updated);
      setCart(updated);
      return;
    }
    try {
      const data = await cartAPI.addToCart({ productId, quantity });
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
