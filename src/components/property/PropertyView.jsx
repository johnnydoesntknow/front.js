// src/components/property/PropertyView.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useContract } from '../../hooks/useContract';
import { useApp } from '../../contexts/AppContext';
import { ethers } from 'ethers';
import { Building, MapPin, Home, DollarSign, Users, Calendar, Loader2, TrendingUp } from 'lucide-react';
import PropertyCard from './PropertyCard';
import PropertyModal from './PropertyModal';

const PropertyView = () => {
  const { isConnected } = useWeb3();
  const { fractionalization } = useContract();
  const { showNotification } = useApp();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, residential, commercial, land

  // Fetch properties from the blockchain
  useEffect(() => {
    const fetchProperties = async () => {
      if (!fractionalization || !isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get active assets that are properties
        const activeAssetIds = await fractionalization.getActiveAssets();
        
        const propertyPromises = activeAssetIds.map(async (tokenId) => {
          const assetDetails = await fractionalization.assetDetails(tokenId);
          const request = await fractionalization.requests(assetDetails.requestId);
          
          // Filter for property types
          const propertyTypes = ['Real Estate', 'Property', 'Land', 'Commercial Property', 'Residential Property'];
          if (!propertyTypes.includes(request.assetType)) return null;
          
          return {
            tokenId: tokenId.toString(),
            requestId: assetDetails.requestId.toString(),
            assetType: request.assetType,
            assetName: request.assetName,
            assetDescription: request.assetDescription,
            assetImageUrl: request.assetImageUrl,
            totalFractions: assetDetails.totalSupply.toString(),
            availableFractions: assetDetails.availableSupply.toString(),
            pricePerFraction: ethers.utils.formatEther(assetDetails.pricePerFraction),
            requiresPurchaserKYC: assetDetails.requiresPurchaserKYC,
            isActive: assetDetails.isActive,
            creator: request.proposer,
            totalRevenue: ethers.utils.formatEther(assetDetails.totalRevenue),
            // Parse property-specific data from description or metadata
            propertyData: parsePropertyData(request.assetDescription)
          };
        });

        const fetchedProperties = (await Promise.all(propertyPromises)).filter(p => p !== null);
        setProperties(fetchedProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
        showNotification('Failed to load properties', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [fractionalization, isConnected]);

  // Parse property data from description (in production, this would come from metadata)
  const parsePropertyData = (description) => {
    // Simple parsing - in production, use structured metadata
    const data = {
      location: 'Location not specified',
      size: 'Size not specified',
      type: 'Residential',
      yearBuilt: 'Year not specified',
      features: []
    };
    
    // Extract location if mentioned
    const locationMatch = description.match(/located in ([^.,]+)/i);
    if (locationMatch) data.location = locationMatch[1];
    
    // Extract size if mentioned
    const sizeMatch = description.match(/(\d+[\d,]*)\s*(sq\.?\s*ft|square feet|sqft)/i);
    if (sizeMatch) data.size = sizeMatch[0];
    
    return data;
  };

  const filteredProperties = properties.filter(property => {
    if (filter === 'all') return true;
    const type = property.assetType.toLowerCase();
    if (filter === 'residential') return type.includes('residential') || type === 'real estate';
    if (filter === 'commercial') return type.includes('commercial');
    if (filter === 'land') return type.includes('land');
    return true;
  });

  const stats = {
    totalProperties: properties.length,
    totalValue: properties.reduce((sum, p) => sum + (parseFloat(p.pricePerFraction) * parseInt(p.totalFractions)), 0),
    avgFractionPrice: properties.length > 0 
      ? properties.reduce((sum, p) => sum + parseFloat(p.pricePerFraction), 0) / properties.length 
      : 0,
    totalFractions: properties.reduce((sum, p) => sum + parseInt(p.totalFractions), 0)
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-neutral-500 mx-auto mb-4" />
          <h2 className="heading-2 text-white mb-4">Connect Your Wallet</h2>
          <p className="body-text">Connect your wallet to view property investments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Animated Background Circles - Fixed position with proper z-index */}
      <div 
        className="fixed inset-0 pointer-events-none" 
        style={{ zIndex: 0 }}
      >
        {/* Circle 1 - Large, slow pulse */}
        <div 
          className="absolute -top-40 -right-40 w-72 sm:w-96 h-72 sm:h-96 rounded-full border border-white/10"
          style={{
            animation: 'pulseSlow 4s ease-in-out infinite'
          }}
        />
        
        {/* Circle 2 - Medium, rotating */}
        <div 
          className="absolute top-20 -left-20 w-48 sm:w-64 h-48 sm:h-64 rounded-full border border-white/5"
          style={{
            animation: 'rotateSlow 20s linear infinite'
          }}
        />
        
        {/* Circle 3 - Small, pulsing gradient */}
        <div 
          className="absolute bottom-20 right-10 sm:right-40 w-24 sm:w-32 h-24 sm:h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
        
        {/* Circle 4 - Extra large, reverse rotation */}
        <div 
          className="absolute -bottom-64 -left-32 sm:-left-64 w-[24rem] sm:w-[32rem] h-[24rem] sm:h-[32rem] rounded-full border border-white/5"
          style={{
            animation: 'rotateReverse 30s linear infinite'
          }}
        />
        
        {/* Circle 5 - Medium gradient, floating */}
        <div 
          className="absolute top-1/2 right-1/4 sm:right-1/3 w-36 sm:w-48 h-36 sm:h-48 rounded-full blur-xl"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)',
            animation: 'floatAnimation 6s ease-in-out infinite'
          }}
        />
        
        {/* Additional decorative circles */}
        <div 
          className="absolute top-1/3 left-1/4 w-20 sm:w-24 h-20 sm:h-24 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            animation: 'floatAnimation 8s ease-in-out infinite reverse'
          }}
        />
        
        <div 
          className="absolute bottom-1/3 right-1/4 w-32 sm:w-40 h-32 sm:h-40 rounded-full border border-white/5"
          style={{
            animation: 'pulseSlow 6s ease-in-out infinite'
          }}
        />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulseSlow {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.6; 
            transform: scale(1.05); 
          }
        }

        @keyframes rotateSlow {
          from { 
            transform: rotate(0deg); 
          }
          to { 
            transform: rotate(360deg); 
          }
        }

        @keyframes rotateReverse {
          from { 
            transform: rotate(360deg); 
          }
          to { 
            transform: rotate(0deg); 
          }
        }

        @keyframes floatAnimation {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
          }
          25% { 
            transform: translateY(-20px) translateX(10px); 
          }
          50% { 
            transform: translateY(10px) translateX(-10px); 
          }
          75% { 
            transform: translateY(-10px) translateX(20px); 
          }
        }

        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.5; 
            transform: scale(0.95); 
          }
        }

        /* Hide scrollbar on mobile for horizontal scroll */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Main Content - Positioned above background with proper z-index */}
      <div className="relative" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-2">Property Investments</h1>
            <p className="text-sm sm:text-base text-neutral-400 font-light">
              Invest in fractionalized real estate properties. Own a piece of premium properties worldwide.
            </p>
          </div>

          {/* Stats - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 md:mb-16">
            <div className="card p-4 sm:p-6 border" style={{borderColor: 'rgba(34, 128, 205, 0.3)'}}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Building className="w-6 sm:w-8 h-6 sm:h-8 text-neutral-500" />
                <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
              </div>
              <p className="label-text mb-1 sm:mb-2 text-xs sm:text-sm">Total Properties</p>
              <p className="text-xl sm:text-2xl font-light text-white">{stats.totalProperties}</p>
            </div>
            
            <div className="card p-4 sm:p-6 border" style={{borderColor: 'rgba(34, 128, 205, 0.3)'}}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <DollarSign className="w-6 sm:w-8 h-6 sm:h-8 text-neutral-500" />
              </div>
              <p className="label-text mb-1 sm:mb-2 text-xs sm:text-sm">Total Value Locked</p>
              <p className="text-xl sm:text-2xl font-light text-white">{stats.totalValue.toFixed(2)} OPN</p>
            </div>
            
            <div className="card p-4 sm:p-6 border" style={{borderColor: 'rgba(34, 128, 205, 0.3)'}}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Users className="w-6 sm:w-8 h-6 sm:h-8 text-neutral-500" />
              </div>
              <p className="label-text mb-1 sm:mb-2 text-xs sm:text-sm">Avg. Fraction Price</p>
              <p className="text-xl sm:text-2xl font-light text-white">{stats.avgFractionPrice.toFixed(3)} OPN</p>
            </div>
            
            <div className="card p-4 sm:p-6 border" style={{borderColor: 'rgba(34, 128, 205, 0.3)'}}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Home className="w-6 sm:w-8 h-6 sm:h-8 text-neutral-500" />
              </div>
              <p className="label-text mb-1 sm:mb-2 text-xs sm:text-sm">Total Fractions</p>
              <p className="text-xl sm:text-2xl font-light text-white">{stats.totalFractions.toLocaleString()}</p>
            </div>
          </div>

          {/* Filters - Responsive and Scrollable on Mobile */}
          <div className="mb-6 sm:mb-8 border-b" style={{borderColor: 'rgba(34, 128, 205, 0.3)'}}>
            <div className="flex items-center space-x-0 overflow-x-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-light transition-all duration-200 whitespace-nowrap border-b-2 ${
                  filter === 'all' 
                    ? 'text-white border-white' 
                    : 'text-neutral-500 hover:text-white border-transparent'
                }`}
              >
                All Properties
              </button>
              <button
                onClick={() => setFilter('residential')}
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-light transition-all duration-200 whitespace-nowrap border-b-2 ${
                  filter === 'residential' 
                    ? 'text-white border-white' 
                    : 'text-neutral-500 hover:text-white border-transparent'
                }`}
              >
                Residential
              </button>
              <button
                onClick={() => setFilter('commercial')}
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-light transition-all duration-200 whitespace-nowrap border-b-2 ${
                  filter === 'commercial' 
                    ? 'text-white border-white' 
                    : 'text-neutral-500 hover:text-white border-transparent'
                }`}
              >
                Commercial
              </button>
              <button
                onClick={() => setFilter('land')}
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-light transition-all duration-200 whitespace-nowrap border-b-2 ${
                  filter === 'land' 
                    ? 'text-white border-white' 
                    : 'text-neutral-500 hover:text-white border-transparent'
                }`}
              >
                Land
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20 sm:py-32">
              <Loader2 className="w-6 sm:w-8 h-6 sm:h-8 text-white animate-spin" />
            </div>
          )}

          {/* Properties Grid - Responsive */}
          {!loading && filteredProperties.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProperties.map(property => (
                <PropertyCard
                  key={property.tokenId}
                  property={property}
                  onViewDetails={(property) => {
                    setSelectedProperty(property);
                    setShowPropertyModal(true);
                  }}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProperties.length === 0 && (
            <div className="text-center py-20 sm:py-32">
              <Building className="w-12 sm:w-16 h-12 sm:h-16 text-neutral-500 mx-auto mb-4" />
              <p className="text-neutral-500 text-base sm:text-lg font-light">
                No properties available in this category
              </p>
              <p className="text-neutral-600 text-xs sm:text-sm mt-2">
                Check back later or try a different filter
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Property Details Modal */}
      {showPropertyModal && selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setShowPropertyModal(false)}
        />
      )}
    </div>
  );
};

export default PropertyView;