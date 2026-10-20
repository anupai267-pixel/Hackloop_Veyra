import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Search,
  ShoppingBag,
  Heart,
  Bell,
  User,
  LogOut,
  PlusCircle,
  Radio,
  Clock,
  Menu,
  X,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    cartCount,
    wishlist,
    unreadNotificationsCount,
    setIsCartDrawerOpen,
    setIsNotificationsOpen
  } = useMarketplace();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (location.pathname !== '/shop') {
      navigate('/shop');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5]">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* LEFT CLUSTER: [ VEYRA Logo ] and immediately beside it [ Sign In / Account ] */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Veyra Brand Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 focus:outline-none"
              title="Veyra Marketplace Home"
            >
              <div className="w-8 h-8 rounded bg-[#171717] text-white flex items-center justify-center font-bold text-sm tracking-wider">
                V
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-[#171717] leading-none">
                  VEYRA
                </span>
                <span className="text-[9px] tracking-widest uppercase text-[#666666] font-medium leading-tight">
                  Marketplace
                </span>
              </div>
            </Link>

            {/* Sign In option immediately beside Logo */}
            <div className="pl-2 border-l border-[#E5E5E5]">
              {!user ? (
                <button
                  onClick={() => navigate('/signin')}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-[#222222] text-white hover:bg-[#383838] transition-colors flex items-center gap-1.5"
                  title="Sign In to Veyra"
                  data-testid="navbar-signin-button"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-[#F5F5F5] text-[#171717] transition-colors"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#222222] text-white text-[10px] flex items-center justify-center font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                    <span className="max-w-[90px] truncate hidden sm:inline">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#666666]" />
                  </button>

                  {/* Profile Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white border border-[#E5E5E5] rounded shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-[#E5E5E5]">
                        <p className="text-xs text-[#666666]">Signed in as</p>
                        <p className="text-sm font-semibold text-[#171717] truncate">{user.name}</p>
                        <p className="text-xs text-[#666666] truncate">{user.email}</p>
                        {user.isDemo && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold bg-[#F5F5F5] text-[#171717] border border-[#E5E5E5] rounded">
                            DEMO SESSION ({user.role})
                          </span>
                        )}
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs text-[#171717] hover:bg-[#F5F5F5]"
                      >
                        User Profile & Settings
                      </Link>
                      <Link
                        to="/seller/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs text-[#171717] hover:bg-[#F5F5F5]"
                      >
                        Seller Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#B91C1C] hover:bg-[#F5F5F5] flex items-center gap-1.5 border-t border-[#E5E5E5]"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SEARCH BAR WITH CATEGORY FILTER */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg items-center border border-[#E5E5E5] rounded bg-[#FAFAFA] overflow-hidden focus-within:border-[#171717] focus-within:bg-white transition-colors"
          >
            {/* Category Filter Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-[#666666] px-3 py-2 border-r border-[#E5E5E5] focus:outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search verified items, models, identifiers..."
                className="w-full bg-transparent px-3 py-2 text-xs text-[#171717] placeholder-[#666666] focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-2 text-[#666666] hover:text-[#171717] transition-colors"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* DESKTOP NAVIGATION LINKS */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-[#171717]">
            <Link
              to="/"
              className={`hover:text-[#383838] transition-colors ${location.pathname === '/' ? 'border-b-2 border-[#171717] pb-1' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`hover:text-[#383838] transition-colors ${location.pathname === '/shop' ? 'border-b-2 border-[#171717] pb-1' : ''}`}
            >
              Shop
            </Link>
            <Link
              to="/live-auctions"
              className={`flex items-center gap-1 hover:text-[#383838] transition-colors ${location.pathname === '/live-auctions' ? 'border-b-2 border-[#171717] pb-1' : ''}`}
            >
              <Radio className="w-3.5 h-3.5 text-[#B91C1C]" />
              Live Auctions
            </Link>
            <Link
              to="/scheduled-auctions"
              className={`flex items-center gap-1 hover:text-[#383838] transition-colors ${location.pathname === '/scheduled-auctions' ? 'border-b-2 border-[#171717] pb-1' : ''}`}
            >
              <Clock className="w-3.5 h-3.5 text-[#666666]" />
              Scheduled
            </Link>
            <Link
              to="/seller/new-listing"
              className="px-2.5 py-1 rounded border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-[#F5F5F5] transition-colors flex items-center gap-1 font-medium"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#171717]" />
              Sell
            </Link>
          </nav>

          {/* RIGHT ACTION ICONS: Wishlist, Notifications, Cart */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 rounded border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#171717] transition-colors relative"
              title="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#171717] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2 rounded border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#171717] transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B91C1C] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="p-2 rounded border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#171717] transition-colors relative"
              title="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#222222] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#171717]"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* MOBILE COLLAPSIBLE MENU */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#E5E5E5] space-y-3 bg-white">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalogue..."
                className="flex-1 input-field text-xs"
              />
              <button type="submit" className="btn-primary text-xs px-3 py-1.5">
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="space-y-1 pt-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#171717] hover:bg-[#F5F5F5] rounded"
              >
                Home
              </Link>
              <Link
                to="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#171717] hover:bg-[#F5F5F5] rounded"
              >
                Shop Catalogue
              </Link>
              <Link
                to="/live-auctions"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#B91C1C] hover:bg-[#F5F5F5] rounded"
              >
                <Radio className="w-3.5 h-3.5" />
                Live Auctions
              </Link>
              <Link
                to="/scheduled-auctions"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#171717] hover:bg-[#F5F5F5] rounded"
              >
                <Clock className="w-3.5 h-3.5" />
                Scheduled Auctions
              </Link>
              <Link
                to="/seller/new-listing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#171717] hover:bg-[#F5F5F5] rounded"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Sell on Veyra
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#171717] hover:bg-[#F5F5F5] rounded"
              >
                <Heart className="w-3.5 h-3.5" />
                Wishlist ({wishlist.length})
              </Link>
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-xs font-medium text-[#171717] hover:bg-[#F5F5F5] rounded"
                  >
                    User Profile ({user.name})
                  </Link>
                  <Link
                    to="/seller/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-xs font-medium text-[#171717] hover:bg-[#F5F5F5] rounded"
                  >
                    Seller Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#B91C1C] hover:bg-[#F5F5F5] rounded flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/signin');
                  }}
                  className="w-full btn-primary text-xs mt-2"
                >
                  Sign In to Veyra
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
