// src/components/property/PropertyCard.jsx
import React from 'react';
import { MapPin, Home, Maximize, Calendar } from 'lucide-react';

const PropertyCard = ({ property, onViewDetails }) => {
  const availablePercentage = (parseInt(property.availableShares || 0) / parseInt(property.totalShares || 1)) * 100;
  const totalValue = parseFloat(property.pricePerShare || 0) * parseInt(property.totalShares || 0);
  
  return (
    <div className="card-hover group cursor-pointer" onClick={() => onViewDetails(property)}>
      {/* Image */}
      <div className="relative aspect-[4/3] bg-neutral-950 overflow-hidden">
        <img 
          src={property.assetImageUrl} 
          alt={property.assetName}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 
                     transition-opacity duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
          }}
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs 
                         uppercase tracking-wider rounded-sm">
            {property.assetType}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-normal text-white mb-3">{property.assetName}</h3>
        
        {/* Property Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-neutral-400">
            <MapPin className="w-4 h-4 mr-2 text-neutral-500" />
            <span>{property.propertyData?.location || 'Location not specified'}</span>
          </div>
          <div className="flex items-center text-sm text-neutral-400">
            <Maximize className="w-4 h-4 mr-2 text-neutral-500" />
            <span>{property.propertyData?.size || 'Size not specified'}</span>
          </div>
        </div>
        
        {/* Investment Details */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-neutral-900">
          <div>
            <p className="label-text mb-1">Price per share</p>
            <p className="text-white font-light">{property.pricePerShare} OPN</p>
          </div>
          <div>
            <p className="label-text mb-1">Total Value</p>
            <p className="text-white font-light">{totalValue.toFixed(2)} OPN</p>
          </div>
        </div>

        {/* Availability */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-500">Available</span>
            <span className="text-white">
              {property.availableShares}/{property.totalShares} shares
            </span>
          </div>
          <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
              style={{ width: `${availablePercentage}%` }}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="mt-6 flex flex-wrap gap-2">
          {property.requiresPurchaserKYC && (
            <span className="text-xs uppercase tracking-wider text-neutral-500 
                           px-2 py-1 border border-neutral-800 rounded-sm">
              KYC Required
            </span>
          )}
          <span className="text-xs uppercase tracking-wider text-green-500 
                         px-2 py-1 border border-green-900 rounded-sm">
            {availablePercentage.toFixed(0)}% Available
          </span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;