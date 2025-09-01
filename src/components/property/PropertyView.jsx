// src/components/property/PropertyView.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useContract } from '../../hooks/useContract';
import { useApp } from '../../contexts/AppContext';
import { ethers } from 'ethers';
import { Building, MapPin, Home, DollarSign, Users, AlertCircle, Calendar, Loader2, TrendingUp } from 'lucide-react';
import PropertyCard from './PropertyCard';
import PropertyDetailView from './PropertyDetailView';

// Comprehensive asset data parser
const parseAssetData = (asset) => {
  const description = asset.assetDescription || '';
  const assetType = asset.assetType || '';
  
  // Parse additional images
  const parseAdditionalImages = (desc) => {
    const images = [];
    const additionalImagesMatch = desc.match(/Additional Images:([\s\S]*?)(?:\n\n|Documents:|$)/);
    
    if (additionalImagesMatch && additionalImagesMatch[1]) {
      const imagesSection = additionalImagesMatch[1];
      const imageMatches = imagesSection.matchAll(/Image \d+: (https?:\/\/[^\s\n]+)/g);
      
      for (const match of imageMatches) {
        if (match[1]) {
          images.push(match[1]);
        }
      }
    }
    return images;
  };
  
  // Parse Real Estate property data
  const parseRealEstateData = (desc) => {
    const data = {
      location: 'Dubai, United Arab Emirates',
      propertyType: null,
      size: null,
      yearBuilt: null
    };
    
    // Parse location
    const locationMatch = desc.match(/Location: ([^\n]+)/i);
    if (locationMatch) {
      data.location = locationMatch[1].trim();
    }
    
    // Parse size
    const sizeMatch = desc.match(/Size: ([\d,.]+ (?:sq\.?\s*ft|sqft|square feet|acres))/i);
    if (sizeMatch) {
      data.size = sizeMatch[1].trim();
    }
    
    // Parse property type
    if (desc.includes('Residential Property')) {
      data.propertyType = 'Residential';
    } else if (desc.includes('Commercial Property')) {
      data.propertyType = 'Commercial';
    } else if (desc.includes('Land')) {
      data.propertyType = 'Land';
    }
    
    return data;
  };
  
  // Parse Vehicle data
  const parseVehicleData = (desc) => {
    const data = {
      year: null,
      make: null,
      model: null,
      vin: null
    };
    
    const vehicleMatch = desc.match(/Vehicle Details:([\s\S]*?)(?:\n\n|Additional Images:|Documents:|$)/);
    
    if (vehicleMatch && vehicleMatch[1]) {
      const vehicleSection = vehicleMatch[1];
      
      const yearMatch = vehicleSection.match(/Year: (\d{4})/);
      if (yearMatch) data.year = yearMatch[1];
      
      const makeMatch = vehicleSection.match(/Make: ([^\n]+)/);
      if (makeMatch) data.make = makeMatch[1].trim();
      
      const modelMatch = vehicleSection.match(/Model: ([^\n]+)/);
      if (modelMatch) data.model = modelMatch[1].trim();
      
      const vinMatch = vehicleSection.match(/VIN: ([^\n]+)/);
      if (vinMatch) data.vin = vinMatch[1].trim();
    }
    
    return data;
  };
  
  // Base parsed data
  const parsedData = {
    ...asset,
    additionalImages: parseAdditionalImages(description),
  };
  
  // Parse type-specific data
  if (assetType.toLowerCase().includes('vehicle')) {
    parsedData.vehicleData = parseVehicleData(description);
  } else {
    // Default to property data for real estate assets
    parsedData.propertyData = parseRealEstateData(description);
  }
  
  return parsedData;
};

const PropertyView = () => {
  const { isConnected } = useWeb3();
  const { fractionalization } = useContract();
  const { showNotification } = useApp();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchProperties = async () => {
      if (!fractionalization || !isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const result = await fractionalization.getActiveAssets(0, 100);
        const activeAssetIds = result.assetIds || result[0];
        
        const propertyPromises = activeAssetIds.map(async (tokenId) => {
          const assetDetails = await fractionalization.assetDetails(tokenId);
          const request = await fractionalization.requests(assetDetails.requestId);
          
          // STRICT FILTER: Only real estate and vehicle assets for properties section
          const allowedTypes = [
            'Real Estate', 
            'Property', 
            'Land', 
            'Commercial Property', 
            'Residential Property',
            'Commercial',
            'Residential',
            'Vehicles',
            'Vehicle'
          ];
          
          const isAllowedAsset = allowedTypes.some(type => 
            request.assetType.toLowerCase().includes(type.toLowerCase()) ||
            type.toLowerCase().includes(request.assetType.toLowerCase())
          );
          
          if (!isAllowedAsset) return null;
          
          const baseAsset = {
            tokenId: tokenId.toString(),
            requestId: assetDetails.requestId.toString(),
            assetType: request.assetType,
            assetName: request.assetName,
            assetDescription: request.assetDescription,
            assetImageUrl: request.assetImageUrl,
            totalShares: assetDetails.totalShares?.toString() || '0',
            availableShares: assetDetails.availableShares?.toString() || '0',
            pricePerShare: ethers.utils.formatEther(assetDetails.pricePerShare),
            requiresPurchaserKYC: assetDetails.requiresPurchaserKYC,
            isActive: assetDetails.isActive,
            creator: request.proposer,
            totalRevenue: ethers.utils.formatEther(assetDetails.totalRevenue),
            minPurchaseAmount: assetDetails.minPurchaseAmount?.toString() || '1',
            maxPurchaseAmount: assetDetails.maxPurchaseAmount?.toString() || '0',
          };
          
          // Parse the asset data to extract additional images and type-specific data
          return parseAssetData(baseAsset);
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

  const filteredProperties = properties.filter(property => {
    if (filter === 'all') return true;
    const type = property.assetType.toLowerCase();
    
    if (filter === 'residential') {
      return type.includes('residential') || (type === 'real estate' && !type.includes('commercial'));
    }
    if (filter === 'commercial') {
      return type.includes('commercial');
    }
    if (filter === 'land') {
      return type.includes('land');
    }
    if (filter === 'vehicles') {
      return type.includes('vehicle');
    }
    return true;
  });

  const stats = {
    totalProperties: properties.length,
    totalValue: properties.reduce((sum, p) => sum + (parseFloat(p.pricePerShare || 0) * parseInt(p.totalShares || 0)), 0),
    avgFractionPrice: properties.length > 0 
      ? properties.reduce((sum, p) => sum + parseFloat(p.pricePerShare || 0), 0) / properties.length 
      : 0,
    totalFractions: properties.reduce((sum, p) => sum + parseInt(p.totalShares || 0), 0)
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
          <h2 className="text-xl font-light text-white mb-2">Wallet Not Connected</h2>
          <p className="text-neutral-400 font-light">Please connect your wallet to view property investments</p>
        </div>
      </div>
    );
  }

  if (showDetailView && selectedProperty) {
    return (
      <PropertyDetailView 
        property={selectedProperty} 
        onBack={() => {
          setShowDetailView(false);
          setSelectedProperty(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Animated Background Circles */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div 
          className="absolute -top-40 -right-40 w-72 sm:w-96 h-72 sm:h-96 rounded-full border border-white/10"
          style={{ animation: 'pulseSlow 4s ease-in-out infinite' }}
        />
        <div 
          className="absolute top-20 -left-20 w-48 sm:w-64 h-48 sm:h-64 rounded-full border border-white/5"
          style={{ animation: 'rotateSlow 20s linear infinite' }}
        />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-2 sm:mb-4">
              My Properties
            </h1>
            <p className="text-base sm:text-lg text-neutral-400 font-light">
              View and manage your tokenized real estate and vehicle portfolio
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 md:mb-16">
            <div className="card p-4 sm:p-6 border" style={{borderColor: 'rgba(34, 128, 205, 0.3)'}}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Building className="w-6 sm:w-8 h-6 sm:h-8 text-neutral-500" />
                <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
              </div>
              <p className="label-text mb-1 sm:mb-2 text-xs sm:text-sm">Total Assets</p>
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

          {/* Filters */}
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
              <button
                onClick={() => setFilter('vehicles')}
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-light transition-all duration-200 whitespace-nowrap border-b-2 ${
                  filter === 'vehicles' 
                    ? 'text-white border-white' 
                    : 'text-neutral-500 hover:text-white border-transparent'
                }`}
              >
                Vehicles
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20 sm:py-32">
              <Loader2 className="w-6 sm:w-8 h-6 sm:h-8 text-white animate-spin" />
            </div>
          )}

          {/* Properties Grid */}
          {!loading && filteredProperties.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProperties.map(property => (
                <PropertyCard
                  key={property.tokenId}
                  property={property}
                  onViewDetails={(property) => {
                    setSelectedProperty(property);
                    setShowDetailView(true);
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
    </div>
  );
};

export default PropertyView;