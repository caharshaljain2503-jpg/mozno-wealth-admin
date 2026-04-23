// layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Sidebar from '../components/layout/Sidebar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
      // Auto collapse sidebar on medium screens
      if (window.innerWidth < 1280 && window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside 
        className={`
          hidden lg:flex flex-shrink-0
          transition-all duration-300 ease-out
          ${isSidebarOpen ? 'w-64' : 'w-[72px]'}
        `}
      >
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />
      </aside>

      {/* Sidebar - Mobile */}
      <div className="lg:hidden">
        {/* Backdrop */}
        <div 
          className={`
            fixed inset-0 bg-black/50 backdrop-blur-sm z-40
            transition-opacity duration-300
            ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
        
        {/* Sidebar Panel */}
        <aside 
          className={`
            fixed top-0 left-0 h-full w-64 z-50
            transition-transform duration-300 ease-out
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <Sidebar 
            isOpen={true}
            setIsOpen={setIsSidebarOpen}
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
          />
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar 
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Mobile FAB Menu Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className={`
          lg:hidden fixed bottom-6 right-6 z-[60]
          w-14 h-14 rounded-2xl
          bg-neutral-900 text-white
          shadow-lg shadow-neutral-900/30
          flex items-center justify-center
          transition-all duration-300 
          active:scale-95 hover:bg-neutral-800
        `}
        aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}
      >
        <svg 
          className={`w-6 h-6 transition-transform duration-300 ${isMobileSidebarOpen ? 'rotate-90' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth={2}
        >
          {isMobileSidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
    </div>
  );
};

export default Layout;