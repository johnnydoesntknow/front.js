// src/components/marketplace/BuyModal.jsx
import React, { useState, useMemo } from 'react';
import { X, Shield, Info, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const BuyModal = ({ asset, onClose, onPurchase }) => {
  const { showNotification } = useApp();
  const [percentage, setPercentage] = useState(0.1); // Default 0.1%
  const [loading, setLoading] = useState(false);
  
  // Calculate derived values
  const maxPercentage = useMemo(() => {
    const available = parseInt(asset.availableFractions);
    const total = parseInt(asset.totalFractions);
    return (available / total) * 100;
  }, [asset]);
  
  const fractionAmount = useMemo(() => {
    const total = parseInt(asset.totalFractions);
    return Math.floor((percentage / 100) * total);
  }, [percentage, asset.totalFractions]);
  
  const totalCost = useMemo(() => {
    return (parseFloat(asset.pricePerFraction) * fractionAmount).toFixed(2);
  }, [asset.pricePerFraction, fractionAmount]);
  
  const totalAssetValue = useMemo(() => {
    return (parseFloat(asset.pricePerFraction) * parseInt(asset.totalFractions)).toFixed(2);
  }, [asset]);
  
  // Format large numbers professionally
  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };
  
  // Handle percentage input change
  const handlePercentageChange = (value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setPercentage(Math.min(maxPercentage, Math.max(0.001, numValue)));
    }
  };
  
  // Quick percentage buttons
  const quickPercentages = [0.1, 0.5, 1, 5, 10, 25];
  
  const handlePurchase = async () => {
    if (fractionAmount < 1) {
      showNotification('Minimum purchase is 0.001% ownership', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await onPurchase(asset.tokenId, fractionAmount);
      showNotification(
        `Successfully acquired ${percentage.toFixed(3)}% ownership of ${asset.assetName}!`, 
        'success'
      );
      onClose();
    } catch (error) {
      console.error('Purchase error:', error);
      let errorMessage = 'Transaction failed. Please try again.';
      
      if (error.message.includes('KYC')) {
        errorMessage = 'KYC verification required for this asset.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient OPN balance.';
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Executive Design */}
      <div className="relative bg-black border border-neutral-900 max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-neutral-900">
          <div>
            <h2 className="text-2xl font-light text-white">Acquire Ownership</h2>
            <p className="text-sm font-light text-neutral-500 mt-1">
              Purchase fractional ownership verified on-chain
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-900 rounded-sm transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Asset Overview */}
          <div className="grid grid-cols-[120px,1fr] gap-6 mb-8">
            <div className="relative">
              <img 
                src={asset.assetImageUrl} 
                alt={asset.assetName}
                className="w-full aspect-square object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80';
                }}
              />
              {asset.requiresPurchaserKYC && (
                <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs px-2 py-1">
                  KYC
                </div>
              )}
            </div>
            
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-neutral-500 mb-2">
                {asset.assetType}
              </p>
              <h3 className="text-xl font-light text-white mb-2">{asset.assetName}</h3>
              <p className="text-sm font-light text-neutral-400 mb-4">
                {asset.location || 'Premium Asset'}
              </p>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-light text-neutral-500">Total Value</p>
                  <p className="text-sm font-light text-white">{formatNumber(totalAssetValue)} OPN</p>
                </div>
                <div>
                  <p className="text-xs font-light text-neutral-500">Available</p>
                  <p className="text-sm font-light text-white">{maxPercentage.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-xs font-light text-neutral-500">Min. Purchase</p>
                  <p className="text-sm font-light text-white">0.001%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Percentage Selection */}
          <div className="space-y-6">
            {/* Input Section */}
            <div>
              <label className="text-xs font-light uppercase tracking-widest text-neutral-500 mb-3 block">
                Ownership Percentage
              </label>
              
              {/* Percentage Input with Slider */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={percentage}
                      onChange={(e) => handlePercentageChange(e.target.value)}
                      className="w-full px-4 py-3 pr-8 bg-transparent border border-neutral-800 
                               text-2xl font-light text-white text-center
                               focus:border-neutral-600 focus:outline-none transition-colors"
                      min="0.001"
                      max={maxPercentage}
                      step="0.001"
                      disabled={loading}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg">
                      %
                    </span>
                  </div>
                </div>
                
                {/* Visual Slider */}
                <div className="relative">
                  <input
                    type="range"
                    value={percentage}
                    onChange={(e) => handlePercentageChange(e.target.value)}
                    className="w-full h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none 
                             [&::-webkit-slider-thumb]:w-4 
                             [&::-webkit-slider-thumb]:h-4 
                             [&::-webkit-slider-thumb]:bg-white 
                             [&::-webkit-slider-thumb]:rounded-full
                             [&::-webkit-slider-thumb]:cursor-pointer
                             [&::-webkit-slider-thumb]:transition-transform
                             [&::-webkit-slider-thumb]:hover:scale-125"
                    min="0.001"
                    max={maxPercentage}
                    step="0.001"
                    disabled={loading}
                  />
                  <div 
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-neutral-600 to-neutral-500 rounded-full pointer-events-none"
                    style={{ width: `${(percentage / maxPercentage) * 100}%` }}
                  />
                </div>
                
                {/* Quick Select Buttons */}
                <div className="flex gap-2">
                  {quickPercentages.map(pct => (
                    <button
                      key={pct}
                      onClick={() => handlePercentageChange(Math.min(pct, maxPercentage))}
                      disabled={loading || pct > maxPercentage}
                      className={`
                        flex-1 py-2 text-xs font-light transition-all
                        ${pct > maxPercentage 
                          ? 'text-neutral-600 cursor-not-allowed' 
                          : percentage === pct
                            ? 'bg-white text-black'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                        }
                      `}
                    >
                      {pct}%
                    </button>
                  ))}
                  <button
                    onClick={() => handlePercentageChange(maxPercentage)}
                    disabled={loading}
                    className="flex-1 py-2 text-xs font-light text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="bg-neutral-950 border border-neutral-900 p-6 space-y-4">
              <h4 className="text-xs font-light uppercase tracking-widest text-neutral-500">
                Transaction Summary
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light text-neutral-400">Ownership Acquiring</span>
                  <span className="text-lg font-light text-white">{percentage.toFixed(3)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light text-neutral-400">Fraction Count</span>
                  <span className="text-sm font-light text-neutral-300">
                    {fractionAmount.toLocaleString()} units
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light text-neutral-400">Price per Unit</span>
                  <span className="text-sm font-light text-neutral-300">
                    {asset.pricePerFraction} OPN
                  </span>
                </div>
                
                <div className="pt-3 border-t border-neutral-800 flex justify-between items-center">
                  <span className="text-sm font-light text-white">Total Investment</span>
                  <div className="text-right">
                    <p className="text-2xl font-light text-white">{formatNumber(totalCost)}</p>
                    <p className="text-xs font-light text-neutral-500">OPN</p>
                  </div>
                </div>
              </div>
            </div>

            {/* KYC Notice */}
            {asset.requiresPurchaserKYC && (
              <div className="flex items-start gap-3 p-4 border border-amber-900/50 bg-amber-900/10">
                <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm font-light">
                  <p className="text-amber-400 mb-1">KYC Verification Required</p>
                  <p className="text-amber-400/70 text-xs">
                    This asset requires identity verification. Ensure your wallet is KYC-verified before proceeding.
                  </p>
                </div>
              </div>
            )}

            {/* Information */}
            <div className="flex items-start gap-3 p-4 border border-neutral-800">
              <Info className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-light text-neutral-400 leading-relaxed">
                Ownership is verified on-chain through OPN's ATLAS protocol. 
                Each unit represents {(100 / parseInt(asset.totalFractions)).toFixed(6)}% ownership.
                Minimum purchase is 0.001% to ensure meaningful participation.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 p-8 border-t border-neutral-900">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 text-neutral-400 hover:text-white font-light 
                     transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={loading || fractionAmount < 1}
            className="flex-1 py-3 bg-white text-black font-light 
                     hover:bg-neutral-100 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Transaction...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>Acquire {percentage.toFixed(3)}% Ownership</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;