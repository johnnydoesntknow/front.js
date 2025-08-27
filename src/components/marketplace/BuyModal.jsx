// src/components/marketplace/BuyModal.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { X, Shield, Info, Loader2, TrendingUp, AlertCircle, Percent } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const BuyModal = ({ asset, onClose, onPurchase }) => {
  const { showNotification, userKYCStatus } = useApp();
  const [percentage, setPercentage] = useState(0.1); // Default 0.1%
  const [customInput, setCustomInput] = useState('0.1');
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState('buttons'); // 'buttons' or 'custom'
  
  // Calculate maximum available percentage
  const maxPercentage = useMemo(() => {
    const available = parseInt(asset.availableFractions);
    const total = parseInt(asset.totalFractions);
    return (available / total) * 100;
  }, [asset]);
  
  // Calculate fraction amount from percentage
  const fractionAmount = useMemo(() => {
    const total = parseInt(asset.totalFractions);
    return Math.floor((percentage / 100) * total);
  }, [percentage, asset.totalFractions]);
  
  // Calculate total cost
  const totalCost = useMemo(() => {
    return parseFloat(asset.pricePerFraction) * fractionAmount;
  }, [asset.pricePerFraction, fractionAmount]);
  
  // Calculate total asset value
  const totalAssetValue = useMemo(() => {
    return parseFloat(asset.pricePerFraction) * parseInt(asset.totalFractions);
  }, [asset]);
  
  // Format numbers professionally
  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };
  
  const formatPercentage = (num) => {
    return parseFloat(num).toLocaleString('en-US', { 
      minimumFractionDigits: 3, 
      maximumFractionDigits: 3 
    });
  };
  
  // Quick percentage options based on available amount
  const quickPercentages = useMemo(() => {
    const options = [];
    
    // Add standard small percentages
    if (maxPercentage >= 0.1) options.push(0.1);
    if (maxPercentage >= 0.5) options.push(0.5);
    if (maxPercentage >= 1) options.push(1);
    if (maxPercentage >= 5) options.push(5);
    if (maxPercentage >= 10) options.push(10);
    if (maxPercentage >= 25) options.push(25);
    
    // Add max option if different from standard options
    const maxRounded = Math.floor(maxPercentage * 10) / 10;
    if (maxRounded > 0 && !options.includes(maxRounded) && maxRounded !== 25) {
      options.push(maxRounded);
    }
    
    return options;
  }, [maxPercentage]);
  
  // Handle percentage selection
  const handlePercentageSelect = (value) => {
    setPercentage(value);
    setCustomInput(value.toString());
    setInputMode('buttons');
  };
  
  // Handle custom input
  const handleCustomInputChange = (e) => {
    const value = e.target.value;
    setCustomInput(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      const clampedValue = Math.min(maxPercentage, Math.max(0.001, numValue));
      setPercentage(clampedValue);
    }
  };
  
  // Handle slider change
  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    setPercentage(value);
    setCustomInput(value.toString());
    setInputMode('slider');
  };
  
  // Check if user meets KYC requirements
  const meetsKYCRequirement = useMemo(() => {
    if (!asset.requiresPurchaserKYC) return true;
    return userKYCStatus === true;
  }, [asset.requiresPurchaserKYC, userKYCStatus]);
  
  // Handle purchase
  const handlePurchase = async () => {
    if (fractionAmount < 1) {
      showNotification('Minimum purchase is 0.001% ownership', 'error');
      return;
    }
    
    if (!meetsKYCRequirement) {
      showNotification('KYC verification required for this asset', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await onPurchase(asset.tokenId, fractionAmount);
      showNotification(
        `Successfully acquired ${formatPercentage(percentage)}% ownership of ${asset.assetName}!`, 
        'success'
      );
      onClose();
    } catch (error) {
      console.error('Purchase error:', error);
      let errorMessage = 'Transaction failed. Please try again.';
      
      if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient OPN balance.';
      } else if (error.message?.includes('KYC')) {
        errorMessage = 'KYC verification required.';
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
        className="absolute inset-0 bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Executive Design */}
      <div className="relative bg-black border border-neutral-900 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black border-b border-neutral-900">
          <div className="flex items-center justify-between p-8">
            <div>
              <h2 className="text-2xl font-semibold text-white">Acquire Ownership</h2>
<p className="text-sm font-light text-neutral-500 mt-1">
                Select your desired ownership percentage
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
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Asset Overview */}
          <div className="grid grid-cols-[140px,1fr] gap-6 mb-8">
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
                <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-medium px-2 py-1">
                  KYC
                </div>
              )}
            </div>
            
            <div>
              <p className="text-xs font-light uppercase tracking-widest text-neutral-500 mb-2">
                {asset.assetType}
              </p>
              <h3 className="text-xl font-semibold text-white mb-3">{asset.assetName}</h3>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-light text-neutral-500 mb-1">Total Value</p>
<p className="text-sm font-normal text-white">{formatNumber(totalAssetValue)} OPN</p>
                </div>
                <div>
                  <p className="text-xs font-light text-neutral-500 mb-1">Available</p>
                  <p className="text-sm font-light text-green-400">{maxPercentage.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-xs font-light text-neutral-500 mb-1">Min. Purchase</p>
                  <p className="text-sm font-light text-white">0.001%</p>
                </div>
                <div>
                  <p className="text-xs font-light text-neutral-500 mb-1">Unit Price</p>
                  <p className="text-sm font-light text-white">{asset.pricePerFraction} OPN</p>
                </div>
              </div>
            </div>
          </div>

          {/* KYC Warning if needed */}
          {asset.requiresPurchaserKYC && !meetsKYCRequirement && (
            <div className="flex items-start gap-3 p-4 bg-amber-900/10 border border-amber-900/30 mb-6">
              <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-light text-amber-400 mb-1">KYC Verification Required</p>
                <p className="text-xs font-light text-neutral-400">
                  This asset requires identity verification before purchase. Complete KYC to continue.
                </p>
              </div>
            </div>
          )}

          {/* Percentage Selection */}
          <div className="space-y-6">
            {/* Quick Select Buttons */}
            <div>
              <label className="text-xs font-light uppercase tracking-wider text-neutral-400 block mb-4">
                Quick Select Ownership
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {quickPercentages.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handlePercentageSelect(pct)}
                    className={`
                      py-3 px-4 border transition-all duration-200
                      ${percentage === pct 
                        ? 'bg-white text-black border-white' 
                        : 'bg-black text-white border-neutral-800 hover:border-neutral-600'
                      }
                    `}
                    disabled={loading}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input with Slider */}
            <div>
              <label className="text-xs font-light uppercase tracking-wider text-neutral-400 block mb-4">
                Custom Percentage
              </label>
              
              {/* Slider */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0.001"
                  max={maxPercentage}
                  step="0.001"
                  value={percentage}
                  onChange={handleSliderChange}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(percentage / maxPercentage) * 100}%, #262626 ${(percentage / maxPercentage) * 100}%, #262626 100%)`
                  }}
                  disabled={loading}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-neutral-500">0%</span>
                  <span className="text-xs text-neutral-500">{maxPercentage.toFixed(2)}%</span>
                </div>
              </div>
              
              {/* Number Input */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={customInput}
                    onChange={handleCustomInputChange}
                    onFocus={() => setInputMode('custom')}
                    min="0.001"
                    max={maxPercentage}
                    step="0.001"
                    className="w-full px-4 py-3 pr-12 bg-black border border-neutral-800 text-white font-light 
                             focus:border-neutral-600 focus:outline-none transition-colors"
                    placeholder="Enter percentage"
                    disabled={loading}
                  />
                  <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                </div>
                <button
                  onClick={() => handlePercentageSelect(maxPercentage)}
                  className="px-6 py-3 bg-neutral-900 text-white font-light hover:bg-neutral-800 
                           transition-colors border border-neutral-800"
                  disabled={loading}
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Purchase Summary */}
            <div className="bg-neutral-950 border border-neutral-900 p-6">
              <h3 className="text-xs font-light uppercase tracking-wider text-neutral-400 mb-4">
                Transaction Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light text-neutral-400">Ownership Percentage</span>
                  <span className="text-lg font-semibold text-white">{formatPercentage(percentage)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light text-neutral-400">Number of Units</span>
                  <span className="text-sm font-light text-neutral-300">{fractionAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light text-neutral-400">Price per Unit</span>
                  <span className="text-sm font-light text-neutral-300">{asset.pricePerFraction} OPN</span>
                </div>
                
                <div className="h-px bg-neutral-800 my-3"></div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light text-neutral-400">Platform Fee (2.5%)</span>
<span className="text-sm font-normal text-amber-400">
                    {formatNumber(totalCost * 0.025)} OPN
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-base font-normal text-white">Total Cost</span>
<span className="text-2xl font-semibold text-white">

                    {formatNumber(totalCost * 1.025)} OPN
                  </span>
                </div>
              </div>
            </div>

            {/* Information Box */}
            <div className="bg-blue-900/10 border border-blue-900/30 p-4">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs font-light text-neutral-300 space-y-1">
                  <p>• Each unit represents {(100 / parseInt(asset.totalFractions)).toFixed(6)}% ownership</p>
                  <p>• Ownership is immediately tradeable on secondary markets</p>
                  <p>• All transactions are recorded immutably on-chain</p>
                  <p>• Fractional owners may receive proportional dividends if applicable</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-black border-t border-neutral-900">
          <div className="flex gap-4 p-8">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 text-neutral-400 hover:text-white font-light 
                       transition-colors disabled:opacity-50 border border-neutral-800
                       hover:border-neutral-700"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={loading || fractionAmount < 1 || !meetsKYCRequirement}
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
                  <span>Acquire {formatPercentage(percentage)}% Ownership</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;