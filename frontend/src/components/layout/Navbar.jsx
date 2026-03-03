import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ toggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-40">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Menu Button */}
            {isAuthenticated && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 md:hidden"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-l from-primary-600 to-primary-800 text-transparent bg-clip-text">
                HandyMasters
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث عن حرفيين، خدمات، منشورات..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                type="submit"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-600"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Left Section */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <>
                <Link
                  to="/chat"
                  className="hidden md:block p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 relative"
                >
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>
                
                <Link
                  to="/notifications"
                  className="hidden md:block p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 relative"
                >
                  <BellIcon className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center space-x-2"
                >
                  <img
                    src={user?.avatar || '/default-avatar.png'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary-500"
                  />
                </Link>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 dark:text-primary-400 dark:border-primary-400"
                >
                  تسجيل دخول
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4"
            >
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث..."
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;