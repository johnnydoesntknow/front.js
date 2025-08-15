// src/components/marketplace/AssetCard.jsx
import React from 'react';
import { Shield, Activity, ArrowUpRight } from 'lucide-react';

const AssetCard = ({ asset, onBuyClick }) => {
  const ownershipPercentage = ((parseInt(asset.totalFractions) - parseInt(asset.availableFractions)) / parseInt(asset.totalFractions) * 100).toFixed(1);
  const totalValue = (parseFloat(asset.pricePerFraction) * parseInt(asset.totalFractions)).toFixed(2);
  
  // Format large numbers professionally
  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('en-US');
  };

  return (
    <div className="group relative bg-black border border-neutral-900 rounded-sm overflow-hidden transition-all duration-500 hover:border-neutral-800">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-950">
        <img 
          src={asset.assetImageUrl} 
          alt={asset.assetName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Asset Type Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-xs font-light text-white/80 rounded-sm">
            {asset.assetType}
          </span>
        </div>
        
        {/* Verification Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-sm">
          <Shield className="w-3 h-3 text-green-400" />
          <span className="text-xs font-light text-green-400">Verified</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-lg font-light text-white mb-1 line-clamp-1">
          {asset.assetName}
        </h3>
        
        {/* Location/Description */}
        <p className="text-sm font-light text-neutral-500 mb-6 line-clamp-1">
          {asset.location || asset.assetDescription || 'Premium Asset'}
        </p>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs font-light text-neutral-500 mb-1">Price per Fraction</p>
            <p className="text-sm font-light text-white">{formatNumber(asset.pricePerFraction)} OPN</p>
          </div>
          <div>
            <p className="text-xs font-light text-neutral-500 mb-1">Total Value</p>
            <p className="text-sm font-light text-white">{formatNumber(totalValue)} OPN</p>
          </div>
          <div>
            <p className="text-xs font-light text-neutral-500 mb-1">Available</p>
            <p className="text-sm font-light text-white">{formatNumber(asset.availableFractions)} / {formatNumber(asset.totalFractions)}</p>
          </div>
          <div>
            <p className="text-xs font-light text-neutral-500 mb-1">Ownership Sold</p>
            <p className="text-sm font-light text-white">{ownershipPercentage}%</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-gradient-to-r from-neutral-700 to-neutral-600 transition-all duration-500"
            style={{ width: `${ownershipPercentage}%` }}
          />
        </div>
        
        {/* Action Button */}
        <button
          onClick={() => onBuyClick(asset)}
          className="w-full py-3 bg-white text-black font-light text-sm rounded-sm 
                     transition-all duration-300 hover:bg-neutral-100 
                     flex items-center justify-center gap-2 group/btn"
        >
          <span>View Details</span>
          <ArrowUpRight className="w-3 h-3 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </button>
      </div>
      
      {/* Additional Status Indicators */}
      <div className="absolute bottom-6 right-6 flex gap-2">
        {/* Activity Indicator */}
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Active Listing" />
        
        {/* Fee Indicator - if you add fee data */}
        {asset.monthlyFees && (
          <div className="text-xs text-neutral-500">
            {formatNumber(asset.monthlyFees)} OPN/mo
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetCard;