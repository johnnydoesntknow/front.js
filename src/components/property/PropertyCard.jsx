// src/components/property/PropertyCard.jsx
import React, { useState } from 'react';
import { Shield, Activity, ArrowUpRight, X } from 'lucide-react';

const PropertyCard = ({ property, onViewDetails }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const totalShares = parseInt(property.totalShares || 0);
  const availableShares = parseInt(property.availableShares || 0);
  const soldShares = totalShares - availableShares;
  const ownershipPercentage = totalShares > 0 ? ((soldShares / totalShares) * 100).toFixed(1) : '0.0';
  const totalValue = (parseFloat(property.pricePerShare || 0) * totalShares).toFixed(2);
  
  const formatNumber = (num) => {
    return parseFloat(num || 0).toLocaleString('en-US');
  };
  
  // Check if description is longer than 150 characters
  const description = property.assetDescription || 'Field of dreams for a dream home.';
  const isLongDescription = description.length > 150;
  const truncatedDescription = isLongDescription ? description.substring(0, 150) + '...' : description;

  return (
    <>
      <div className="group relative bg-black border border-neutral-900 rounded-sm overflow-hidden transition-all duration-500 hover:border-neutral-800 flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-950">
          <img 
            src={property.assetImageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'} 
            alt={property.assetName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Asset Type Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-xs font-normal text-white/80 rounded-sm">
              {property.assetType || 'Land'}
            </span>
          </div>
          
          {/* Verification Badge */}
          {property.isVerified && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 px-3 py-1 bg-green-900/30 backdrop-blur-sm rounded-sm">
                <Shield className="w-3 h-3 text-green-400" />
                <span className="text-xs font-normal text-green-400">Verified</span>
              </div>
            </div>
          )}
        </div>

        {/* Content - flex-grow to push button to bottom */}
        <div className="p-6 flex flex-col flex-grow">
          {/* Title */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {property.assetName}
            </h3>
          </div>
          
          {/* Description Section */}
          <div className="mb-4">
            <p className="text-sm text-neutral-400 font-light">
              {isLongDescription ? truncatedDescription : description}
            </p>
            {isLongDescription && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullDescription(true);
                }}
                className="text-blue-400 hover:text-blue-300 text-xs mt-1 transition-colors"
              >
                more →
              </button>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-neutral-500 font-light mb-1">Price per Share</p>
              <p className="text-white font-semibold">{property.pricePerShare} OPN</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-light mb-1">Total Value</p>
              <p className="text-white font-semibold">{formatNumber(totalValue)} OPN</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-light mb-1">Available</p>
              <p className="text-green-400 font-semibold">{availableShares} / {totalShares}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-light mb-1">Ownership Sold</p>
              <p className="text-white font-semibold">{ownershipPercentage}%</p>
            </div>
          </div>

          {/* Spacer to push button to bottom */}
          <div className="flex-grow"></div>

          {/* View Details Button - Always at bottom */}
          <button
            onClick={() => onViewDetails(property)}
            className="w-full py-3 bg-white text-black font-normal rounded-sm
                     hover:bg-neutral-100 transition-all duration-300
                     flex items-center justify-center gap-2 group/btn"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </button>
        </div>
      </div>
      
      {/* Full Description Modal */}
      {showFullDescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowFullDescription(false)}
          />
          
          <div className="relative bg-black border border-neutral-900 rounded-sm max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{property.assetName}</h3>
                <button
                  onClick={() => setShowFullDescription(false)}
                  className="p-2 hover:bg-neutral-900 rounded-sm transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-[60vh]">
                <p className="text-neutral-300 font-light leading-relaxed whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyCard;