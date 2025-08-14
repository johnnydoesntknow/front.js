// src/components/marketplace/AssetCard.jsx
import React from 'react';

const AssetCard = ({ asset, onBuyClick }) => {
  const availablePercentage = (parseInt(asset.availableFractions) / parseInt(asset.totalFractions)) * 100;
  
  return (
    <div className="card-hover group">
      {/* Image */}
      <div className="relative aspect-square bg-neutral-950 overflow-hidden">
  <img 
    src={asset.assetImageUrl} 
    alt={asset.assetName}
    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
    onError={(e) => {
      e.target.src = 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800&q=80';
    }}
  />
</div>
      
      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <p className="label-text mb-2">{asset.assetType}</p>
          <h3 className="text-lg font-normal text-white mb-2">{asset.assetName}</h3>
          <p className="text-sm text-neutral-500 line-clamp-2">{asset.assetDescription}</p>
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-neutral-900">
          <div>
            <p className="label-text mb-1">Price per fraction</p>
            <p className="text-white font-light">{asset.pricePerFraction} OPN</p>
          </div>
          <div>
            <p className="label-text mb-1">Available</p>
            <p className="text-white font-light">
              {asset.availableFractions}/{asset.totalFractions}
            </p>
          </div>
        </div>

        {/* Availability Bar */}
        <div className="mt-4 mb-6">
          <div className="h-1 bg-neutral-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${availablePercentage}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            {availablePercentage.toFixed(1)}% available
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {asset.requiresPurchaserKYC && (
              <span className="text-xs uppercase tracking-wider text-neutral-500">
                KYC Required
              </span>
            )}
          </div>
          
          {asset.isActive && parseInt(asset.availableFractions) > 0 && (
            <button
              onClick={() => onBuyClick(asset)}
              className="btn-primary text-sm"
            >
              Purchase
            </button>
          )}
          
          {parseInt(asset.availableFractions) === 0 && (
            <span className="text-xs uppercase tracking-wider text-neutral-500">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetCard;