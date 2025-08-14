// src/components/property/PropertyView.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useContract } from '../../hooks/useContract';
import { useApp } from '../../contexts/AppContext';
import { ethers } from 'ethers'; // ADD THIS IMPORT
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
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-16">
          <h1 className="heading-1 text-white mb-4">Property Investments</h1>
          <p className="body-text max-w-2xl">
            Invest in fractionalized real estate properties.
            Own a piece of premium properties worldwide.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <Building className="w-8 h-8 text-neutral-500" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="label-text mb-2">Total Properties</p>
            <p className="text-2xl font-light text-white">{stats.totalProperties}</p>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-neutral-500" />
            </div>
            <p className="label-text mb-2">Total Value Locked</p>
            <p className="text-2xl font-light text-white">{stats.totalValue.toFixed(2)} OPN</p>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-neutral-500" />
            </div>
            <p className="label-text mb-2">Avg. Fraction Price</p>
            <p className="text-2xl font-light text-white">{stats.avgFractionPrice.toFixed(3)} OPN</p>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <Home className="w-8 h-8 text-neutral-500" />
            </div>
            <p className="label-text mb-2">Total Fractions</p>
            <p className="text-2xl font-light text-white">{stats.totalFractions.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-light transition-all duration-200 ${
              filter === 'all' 
                ? 'text-white border-b-2 border-white' 
                : 'text-neutral-500 hover:text-white border-b-2 border-transparent'
            }`}
          >
            All Properties
          </button>
          <button
            onClick={() => setFilter('residential')}
            className={`px-4 py-2 text-sm font-light transition-all duration-200 ${
              filter === 'residential' 
                ? 'text-white border-b-2 border-white' 
                : 'text-neutral-500 hover:text-white border-b-2 border-transparent'
            }`}
          >
            Residential
          </button>
          <button
            onClick={() => setFilter('commercial')}
            className={`px-4 py-2 text-sm font-light transition-all duration-200 ${
              filter === 'commercial' 
                ? 'text-white border-b-2 border-white' 
                : 'text-neutral-500 hover:text-white border-b-2 border-transparent'
            }`}
          >
            Commercial
          </button>
          <button
            onClick={() => setFilter('land')}
            className={`px-4 py-2 text-sm font-light transition-all duration-200 ${
              filter === 'land' 
                ? 'text-white border-b-2 border-white' 
                : 'text-neutral-500 hover:text-white border-b-2 border-transparent'
            }`}
          >
            Land
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {/* Properties Grid */}
        {!loading && filteredProperties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="text-center py-32">
            <Building className="w-16 h-16 text-neutral-500 mx-auto mb-4" />
            <p className="text-neutral-500 text-lg font-light">
              No properties available in this category
            </p>
            <p className="text-neutral-600 text-sm mt-2">
              Check back later or try a different filter
            </p>
          </div>
        )}
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