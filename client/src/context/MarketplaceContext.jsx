import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';

const MarketplaceContext = createContext(null);

export const MarketplaceProvider = ({ children }) => {
  const [products, setProducts] = useState(PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Cart State (Persisted)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('veyra_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist State (Persisted)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('veyra_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Welcome to Veyra',
      message: 'Explore verified high-trust listings and live synchronized auctions.',
      time: 'Just now',
      read: false,
      type: 'info'
    },
    {
      id: 'notif-2',
      title: 'Scheduled Auction Alert',
      message: 'Hasselblad 500C/M auction scheduled to begin in 24 hours.',
      time: '2 hours ago',
      read: false,
      type: 'auction'
    }
  ]);

  // UI Modals
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [activeBidModal, setActiveBidModal] = useState(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync Cart to localStorage
  useEffect(() => {
    localStorage.setItem('veyra_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync Wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('veyra_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Cart Actions
  const addToCart = (product, quantity = 1) => {
    if (product.isAuction) {
      addToast('Auction items cannot be purchased directly through the standard cart.', 'warning');
      return;
    }
    if (product.stock < 1) {
      addToast('Sorry, this verified item is currently out of stock.', 'error');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
    addToast(`"${product.title}" added to your bag.`, 'success');
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    addToast('Item removed from bag.', 'info');
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const qty = Math.min(newQuantity, item.product.stock);
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist Actions
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast('Removed from your wishlist.', 'info');
        return prev.filter(id => id !== productId);
      } else {
        addToast('Saved to your wishlist.', 'success');
        return [...prev, productId];
      }
    });
  };

  // Notification Actions
  const markNotificationRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Bid Action (Real-time updates to product auction state)
  const placeBid = (productId, bidAmount, bidderName = 'You (Verified Bidder)') => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId && p.auctionData) {
          return {
            ...p,
            auctionData: {
              ...p.auctionData,
              currentBid: bidAmount,
              bidCount: p.auctionData.bidCount + 1,
              leadingBidder: bidderName
            }
          };
        }
        return p;
      })
    );

    // Add notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: 'Bid Placed Successfully',
      message: `Your bid of ₹${bidAmount.toLocaleString('en-IN')} is now the highest bid.`,
      time: 'Just now',
      read: false,
      type: 'bid'
    };
    setNotifications(prev => [newNotif, ...prev]);
    addToast(`Bid of ₹${bidAmount.toLocaleString('en-IN')} successfully placed!`, 'success');
  };

  // Add newly created listing from seller
  const addProductListing = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
    addToast(`Listing "${newProduct.title}" created successfully.`, 'success');
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <MarketplaceContext.Provider
      value={{
        products,
        categories: CATEGORIES,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        cart,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        activeProductModal,
        setActiveProductModal,
        activeBidModal,
        setActiveBidModal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        placeBid,
        addProductListing,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
