// src/components/marketplace/MarketplaceView.jsx
import React, { useState } from 'react';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useWeb3 } from '../../contexts/Web3Context';
import AssetCard from './AssetCard';
import AssetDetailView from './AssetDetailView';
import { Loader2, Home, Car, Palette, Package } from 'lucide-react';

const MarketplaceView = () => {
  const { assets, loading, error } = useMarketplace();
  const { isConnected } = useWeb3();
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // If an asset is selected, show the detail view
  if (selectedAsset) {
    return (
      <AssetDetailView 
        asset={selectedAsset} 
        onBack={() => setSelectedAsset(null)}
      />
    );
  }
  
  // Asset categories with icons
  const categories = [
    { id: 'all', label: 'All Assets', icon: null },
    { id: 'real-estate', label: 'Real Estate', icon: Home },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'art', label: 'Art', icon: Palette },
    { id: 'collectibles', label: 'Collectibles', icon: Package },
  ];
  
  // Filter assets based on selected category
  const filteredAssets = activeCategory === 'all' 
    ? assets 
    : assets.filter(asset => {
        const categoryMap = {
          'real-estate': ['REAL_ESTATE', 'Real Estate', 'Property'],
          'vehicles': ['VEHICLE', 'Vehicle', 'Car', 'Automobile'],
          'art': ['ART', 'Art', 'Artwork', 'Painting'],
          'collectibles': ['COLLECTIBLE', 'Collectibles', 'LUXURY_WATCH', 'Luxury Watch']
        };
        
        const assetType = asset.assetType || '';
        return categoryMap[activeCategory]?.some(type => 
          assetType.toUpperCase().includes(type.toUpperCase())
        );
      });
  
  // Calculate metrics based on filtered assets
  const totalValue = filteredAssets.reduce((sum, a) => {
    const value = parseFloat(a.pricePerFraction) * parseInt(a.totalFractions);
    return sum + value;
  }, 0);
  
  const totalFractions = filteredAssets.reduce((sum, a) => sum + parseInt(a.totalFractions), 0);
  const totalVolume = filteredAssets.reduce((sum, a) => sum + parseFloat(a.totalRevenue || 0), 0);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Executive Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-light text-white tracking-tight mb-3">
            Asset Marketplace
          </h1>
          <p className="text-neutral-400 font-light">
            Discover premium tokenized assets verified through ATLAS protocol
          </p>
        </div>

        {/* Connection Status - Subtle */}
        {!isConnected && (
          <div className="mb-8 flex items-center gap-3 text-sm text-neutral-500">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span>Wallet connection required for transactions</span>
          </div>
        )}

        {/* Professional Category Navigation */}
        <div className="mb-12 border-b border-neutral-900">
          <nav className="flex">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              const count = category.id === 'all' 
                ? assets.length 
                : assets.filter(asset => {
                    const categoryMap = {
                      'real-estate': ['REAL_ESTATE', 'Real Estate', 'Property'],
                      'vehicles': ['VEHICLE', 'Vehicle', 'Car', 'Automobile'],
                      'art': ['ART', 'Art', 'Artwork', 'Painting'],
                      'collectibles': ['COLLECTIBLE', 'Collectibles', 'LUXURY_WATCH', 'Luxury Watch']
                    };
                    const assetType = asset.assetType || '';
                    return categoryMap[category.id]?.some(type => 
                      assetType.toUpperCase().includes(type.toUpperCase())
                    );
                  }).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    relative flex items-center gap-3 px-8 py-4 
                    transition-all duration-300 border-b-2
                    ${isActive 
                      ? 'text-white border-white' 
                      : 'text-neutral-500 border-transparent hover:text-neutral-300'
                    }
                  `}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span className="font-light">{category.label}</span>
                  <span className={`
                    text-xs font-light
                    ${isActive ? 'text-neutral-300' : 'text-neutral-600'}
                  `}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Executive Metrics Dashboard */}
        <div className="grid grid-cols-4 mb-12">
          <div className="border-r border-neutral-900 pr-8">
            <p className="text-xs font-light uppercase tracking-widest text-neutral-500 mb-1">
              Total Value Locked
            </p>
            <p className="text-2xl font-light text-white">
              {totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs font-light text-neutral-500 mt-1">OPN</p>
          </div>
          <div className="border-r border-neutral-900 px-8">
            <p className="text-xs font-light uppercase tracking-widest text-neutral-500 mb-1">
              Active Assets
            </p>
            <p className="text-2xl font-light text-white">{filteredAssets.length}</p>
            <p className="text-xs font-light text-neutral-500 mt-1">Listed</p>
          </div>
          <div className="border-r border-neutral-900 px-8">
            <p className="text-xs font-light uppercase tracking-widest text-neutral-500 mb-1">
              Total Fractions
            </p>
            <p className="text-2xl font-light text-white">
              {totalFractions.toLocaleString('en-US')}
            </p>
            <p className="text-xs font-light text-neutral-500 mt-1">Minted</p>
          </div>
          <div className="pl-8">
            <p className="text-xs font-light uppercase tracking-widest text-neutral-500 mb-1">
              Trading Volume
            </p>
            <p className="text-2xl font-light text-white">
              {totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs font-light text-neutral-500 mt-1">OPN</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 text-neutral-500 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-32">
            <p className="text-neutral-500 font-light">Unable to load assets</p>
            <p className="text-sm text-neutral-600 mt-2">{error}</p>
          </div>
        )}

        {/* Assets Grid - Refined Layout */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map(asset => (
              <AssetCard 
                key={asset.tokenId} 
                asset={asset}
                onBuyClick={(asset) => setSelectedAsset(asset)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAssets.length === 0 && (
          <div className="text-center py-32">
            <p className="text-neutral-500 font-light text-lg">
              No assets available in this category
            </p>
            <p className="text-neutral-600 font-light text-sm mt-2">
              Check back soon for new listings
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceView;