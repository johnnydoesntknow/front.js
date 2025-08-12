// src/App.jsx
import React, { useState } from 'react';
import { Web3Provider } from './contexts/Web3Context';
import { AppProvider } from './contexts/AppContext';
import Navbar from './components/common/Navbar';
import Notification from './components/common/Notification';
import MarketplaceView from './components/marketplace/MarketplaceView';
import PropertyView from './components/property/PropertyView';
import CreateView from './components/create/CreateView';
import PortfolioView from './components/portfolio/PortfolioView';
import ComplianceView from './components/compliance/ComplianceView';
import LandingPage from './components/landing/LandingPage';

// Import AppKit configuration - this initializes AppKit
import './config/appkit';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeView, setActiveView] = useState('marketplace');

  if (showLanding) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} />;
  }

  return (
    <Web3Provider>
      <AppProvider>
        <div className="min-h-screen bg-black">
          <Navbar activeView={activeView} setActiveView={setActiveView} />
          <Notification />
          
          <main>
            {activeView === 'marketplace' && <MarketplaceView />}
            {activeView === 'property' && <PropertyView />}
            {activeView === 'create' && <CreateView />}
            {activeView === 'portfolio' && <PortfolioView />}
            {activeView === 'compliance' && <ComplianceView />}
          </main>
        </div>
      </AppProvider>
    </Web3Provider>
  );
}