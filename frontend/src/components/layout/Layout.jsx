import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Navbar';
import MobileNav from './MobileNav';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Check if current route is auth page
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {/* Sidebar - Hidden on mobile unless opened */}
        <AnimatePresence mode="wait">
          {sidebarOpen && isMobile && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-0 z-50 md:hidden"
            >
              <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
              <Sidebar isMobile={true} onClose={() => setSidebarOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        {!isMobile && isAuthenticated && (
          <div className="sticky top-0 h-screen">
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${
          !isMobile && isAuthenticated ? 'mr-64' : ''
        }`}>
          <div className="container-custom py-6 md:py-8">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && isAuthenticated && <MobileNav />}
    </div>
  );
};

export default Layout;