// src/components/property/PropertyView.jsx
import React, { useState } from 'react';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useWeb3 } from '../../contexts/Web3Context';
import PropertyCard from './PropertyCard';
import PropertyDetailView from './PropertyDetailView';
import { Loader2, Home, Building2, Trees, Package } from 'lucide-react';

const PropertyView = () => {
  const { assets, loading, error } = useMarketplace();
  const { isConnected } = useWeb3();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // If a property is selected, show the detail view
  if (selectedProperty) {
    return (
      <PropertyDetailView 
        property={selectedProperty} 
        onBack={() => setSelectedProperty(null)}
      />
    );
  }
  
  // Property categories with icons
  const categories = [
    { id: 'all', label: 'All Properties', icon: null },
    { id: 'residential', label: 'Residential', icon: Home },
    { id: 'commercial', label: 'Commercial', icon: Building2 },
    { id: 'land', label: 'Land', icon: Trees },
    { id: 'other', label: 'Other', icon: Package },
  ];
  
  // Filter properties based on selected category
  const filteredProperties = activeCategory === 'all' 
    ? assets 
    : assets.filter(property => {
        const categoryMap = {
          'residential': ['RESIDENTIAL', 'Residential', 'Residential Property'],
          'commercial': ['COMMERCIAL', 'Commercial', 'Commercial Property'],
          'land': ['LAND', 'Land'],
          'other': ['OTHER', 'Other']
        };
        
        const propertyType = property.propertyType || property.assetType || '';
        return categoryMap[activeCategory]?.some(type => 
          propertyType.toUpperCase().includes(type.toUpperCase())
        );
      });
  
  // Calculate metrics based on filtered properties
  const totalValue = filteredProperties.reduce((sum, p) => {
    const price = parseFloat(p.pricePerShare || 0);
    const total = parseInt(p.totalShares || 0);
    const available = parseInt(p.availableShares || 0);
    const sold = total - available;
    return sum + (price * sold);
  }, 0);

  const totalShares = filteredProperties.reduce((sum, p) => {
    return sum + parseInt(p.totalShares || 0);
  }, 0);

  const totalVolume = filteredProperties.reduce((sum, p) => {
    return sum + parseFloat(p.totalRevenue || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Animated Background Circles */}
      <div 
        className="fixed inset-0 pointer-events-none overflow-hidden" 
        style={{ zIndex: 0 }}
      >
        <div 
          className="absolute -top-40 -right-40 w-64 md:w-96 h-64 md:h-96 rounded-full border border-white/10"
          style={{
            animation: 'pulseSlow 4s ease-in-out infinite'
          }}
        />
      </div>

      <style jsx>{`
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Main Content */}
      <div className="relative" style={{ zIndex: 1 }}>
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-12 max-w-[1400px] mx-auto">
          {/* Executive Header */}
          <div className="px-6 lg:px-8 py-4 lg:py-8">
            <h1 className="text-4xl font-light text-white mb-2 pl-14 lg:pl-0">My Properties</h1>
            <p className="text-neutral-400 font-light pl-14 lg:pl-0">
              View and manage your tokenized real estate portfolio
            </p>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="mb-3 sm:mb-4 md:mb-8 flex items-center gap-2 text-[10px] sm:text-xs md:text-sm text-neutral-500">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full animate-pulse" />
              <span>Wallet connection required for transactions</span>
            </div>
          )}

          {/* Category Navigation */}
          <div className="mb-4 sm:mb-6 md:mb-12 -mx-3 sm:mx-0">
            <div className="border-b" style={{borderColor: 'rgba(34, 128, 205, 0.3)'}}>
              <nav className="flex overflow-x-auto scrollbar-hide px-3 sm:px-0">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;
                  const count = category.id === 'all' 
                    ? assets.length 
                    : filteredProperties.filter(property => {
                        const categoryMap = {
                          'residential': ['RESIDENTIAL', 'Residential', 'Residential Property'],
                          'commercial': ['COMMERCIAL', 'Commercial', 'Commercial Property'],
                          'land': ['LAND', 'Land'],
                          'other': ['OTHER', 'Other']
                        };
                        const propertyType = property.propertyType || property.assetType || '';
                        return categoryMap[category.id]?.some(type => 
                          propertyType.toUpperCase().includes(type.toUpperCase())
                        );
                      }).length;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`
                        flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-6 py-2 sm:py-2.5 md:py-4 
                        transition-all duration-200 whitespace-nowrap
                        border-b-2 flex-shrink-0 text-[11px] sm:text-xs md:text-sm min-w-fit
                        ${isActive 
                          ? 'text-white border-white' 
                          : 'text-neutral-500 border-transparent hover:text-neutral-300'}
                      `}
                    >
                      {Icon && <Icon className="w-3 h-3 md:w-4 md:h-4" />}
                      <span className="font-light">{category.label}</span>
                      {count > 0 && (
                        <span className={`
                          px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] md:text-xs rounded-sm
                          ${isActive ? 'bg-neutral-900/50 text-white' : 'bg-neutral-900 text-neutral-600'}
                        `}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-6 mb-4 sm:mb-6 md:mb-12">
            <div className="bg-black/50 backdrop-blur-sm p-3 sm:p-4 md:p-6 border" style={{borderColor: 'rgba(34, 128, 205, 0.3)'}}>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-light uppercase tracking-widest text-neutral-500 mb-0.5 sm:mb-1">
                Total Value Locked
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-light text-white">
                {totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-light text-neutral-500 mt-0.5 sm:mt-1">OPN</p>
            </div>
            
            <div className="bg-black/50 backdrop-blur-sm p-3 sm:p-4 md:p-6 border" style={{borderColor: 'rgba(34, 128, 205, 0.3)'}}>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-light uppercase tracking-widest text-neutral-500 mb-0.5 sm:mb-1">
                Total Shares
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-light text-white">
                {totalShares.toLocaleString('en-US')}
              </p>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-light text-neutral-500 mt-0.5 sm:mt-1">Minted</p>
            </div>
            
            <div className="bg-black/50 backdrop-blur-sm p-3 sm:p-4 md:p-6 border sm:col-span-2 md:col-span-1" style={{borderColor: 'rgba(34, 128, 205, 0.3)'}}>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-light uppercase tracking-widest text-neutral-500 mb-0.5 sm:mb-1">
                Trading Volume
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-light text-white">
                {totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-light text-neutral-500 mt-0.5 sm:mt-1">OPN</p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12 sm:py-20 md:py-32">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-500 animate-spin" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12 md:py-32 px-4">
              <p className="text-neutral-500 font-light text-sm md:text-base">Unable to load properties</p>
              <p className="text-[10px] md:text-xs text-neutral-600 mt-2 break-words overflow-wrap-anywhere max-w-full">
                {error}
              </p>
            </div>
          )}

          {/* Properties Grid */}
          {!loading && !error && filteredProperties.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {filteredProperties.map(property => (
                <PropertyCard 
                  key={property.assetId || property.tokenId}
                  property={property}
                  onViewDetails={(property) => setSelectedProperty(property)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProperties.length === 0 && (
            <div className="text-center py-12 sm:py-20 md:py-32">
              <p className="text-neutral-500 font-light text-sm sm:text-base md:text-lg">
                No properties available in this category
              </p>
              <p className="text-neutral-600 font-light text-xs md:text-sm mt-2">
                Check back soon for new listings
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyView;