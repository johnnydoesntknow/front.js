// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Web3Provider } from './contexts/Web3Context';
import { AppProvider } from './contexts/AppContext';
import Sidebar from './components/layout/sidebar';
import Notification from './components/common/Notification';
import MarketplaceView from './components/marketplace/MarketplaceView';
import PropertyView from './components/property/PropertyView';
import CreateView from './components/create/CreateView';
import PortfolioView from './components/portfolio/PortfolioView';
import ComplianceView from './components/compliance/ComplianceView';
import LandingPage from './components/landing/LandingPage';
// WalletConnect is handled by AppKit's w3m-button
import AutoKYC from './components/AutoKYC';

// Import AppKit configuration - this initializes AppKit
import './config/appkit';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeView, setActiveView] = useState('marketplace');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Check screen size on mount and set sidebar state accordingly
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 768; // md breakpoint
      setIsSidebarCollapsed(isMobile);
    };

    // Check on mount
    checkScreenSize();

    // Optional: Add resize listener to handle window resize
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (showLanding) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} />;
  }

  return (
    <Web3Provider>
      <AppProvider>
        <AutoKYC />
        <div className="flex min-h-screen bg-black">
          {/* Sidebar */}
          <Sidebar 
            isCollapsed={isSidebarCollapsed} 
            toggleSidebar={toggleSidebar}
            activeView={activeView}
            setActiveView={setActiveView}
          />
          
          {/* Main Content Area */}
          <div 
            className={`
              flex-1 transition-all duration-300 ease-in-out
              ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}
            `}
          >
            {/* Page Content */}
            <main className="flex-1">
              {activeView === 'marketplace' && <MarketplaceView />}
              {activeView === 'property' && <PropertyView />}
              {activeView === 'create' && <CreateView />}
              {activeView === 'portfolio' && <PortfolioView />}
              {activeView === 'compliance' && <ComplianceView />}
            </main>
          </div>
        </div>
        
        {/* Global Notification */}
        <Notification />
      </AppProvider>
    </Web3Provider>
  );
}