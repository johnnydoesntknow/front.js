// src/components/property/PropertyModal.jsx
import React, { useState, useEffect } from 'react';
import { X, MapPin, Home, Maximize, Calendar, Users, Shield, Loader2 } from 'lucide-react';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useApp } from '../../contexts/AppContext';

const PropertyModal = ({ property, onClose }) => {
  const { purchaseFractions } = useMarketplace();
  const { showNotification } = useApp();
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const totalCost = (parseFloat(property.pricePerFraction) * amount).toFixed(4);
  const maxAmount = parseInt(property.availableFractions);
  const totalValue = parseFloat(property.pricePerFraction) * parseInt(property.totalFractions);
  const soldPercentage = ((parseInt(property.totalFractions) - parseInt(property.availableFractions)) / parseInt(property.totalFractions)) * 100;
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    // Store original body overflow
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Cleanup function to restore body scroll
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);
  
  const handlePurchase = async () => {
    try {
      setLoading(true);
      await purchaseFractions(property.tokenId, amount);
      showNotification(`Successfully purchased ${amount} fractions!`, 'success');
      onClose();
    } catch (error) {
      console.error('Purchase error:', error);
      showNotification('Transaction failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-black border border-neutral-900 rounded-sm max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-black z-10 flex items-center justify-between p-6 border-b border-neutral-900 flex-shrink-0">
          <h2 className="text-xl font-normal text-white">Property Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-900 rounded-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Left Column - Image and Details */}
            <div>
              <img 
                src={property.assetImageUrl} 
                alt={property.assetName}
                className="w-full aspect-[4/3] object-cover rounded-sm mb-6"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
                }}
              />
              
              <div className="space-y-4">
                <div>
                  <p className="label-text mb-2">{property.assetType}</p>
                  <h3 className="text-2xl font-normal text-white">{property.assetName}</h3>
                </div>
                
                <p className="text-neutral-400">{property.assetDescription}</p>
                
                {/* Property Features */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-950 rounded-sm">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-neutral-500" />
                    <div>
                      <p className="text-xs text-neutral-500">Location</p>
                      <p className="text-white">{property.propertyData?.location || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Maximize className="w-5 h-5 text-neutral-500" />
                    <div>
                      <p className="text-xs text-neutral-500">Size</p>
                      <p className="text-white">{property.propertyData?.size || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Home className="w-5 h-5 text-neutral-500" />
                    <div>
                      <p className="text-xs text-neutral-500">Type</p>
                      <p className="text-white">{property.propertyData?.type || 'Residential'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-neutral-500" />
                    <div>
                      <p className="text-xs text-neutral-500">Year Built</p>
                      <p className="text-white">{property.propertyData?.yearBuilt || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Investment Info */}
            <div>
              {/* Investment Overview */}
              <div className="p-6 bg-neutral-950 rounded-sm mb-6">
                <h4 className="text-lg font-normal text-white mb-4">Investment Overview</h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Total Property Value</span>
                    <span className="text-white font-medium">{totalValue.toFixed(2)} OPN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Price per Fraction</span>
                    <span className="text-white">{property.pricePerFraction} OPN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Total Fractions</span>
                    <span className="text-white">{property.totalFractions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Available Fractions</span>
                    <span className="text-green-400">{property.availableFractions}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-neutral-800">
                    <div className="flex justify-between mb-2">
                      <span className="text-neutral-400">Sold</span>
                      <span className="text-white">{soldPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                        style={{ width: `${soldPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Section */}
              <div className="p-6 border border-neutral-800 rounded-sm">
                <h4 className="text-lg font-normal text-white mb-4">Purchase Fractions</h4>
                
                {property.requiresPurchaserKYC && (
                  <div className="flex items-start space-x-3 p-4 bg-yellow-900/20 border border-yellow-900/50 rounded-sm mb-4">
                    <Shield className="w-5 h-5 text-yellow-200 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-200">
                      <p className="font-medium mb-1">KYC Required</p>
                      <p className="text-yellow-200/80">
                        This property requires KYC verification to purchase.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="label-text block mb-2">NUMBER OF FRACTIONS</label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setAmount(Math.max(1, amount - 1))}
                        className="w-10 h-10 flex items-center justify-center bg-neutral-900 
                                 hover:bg-neutral-800 rounded-sm transition-colors"
                        disabled={amount <= 1}
                      >
                        <span className="text-xl">-</span>
                      </button>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setAmount(Math.min(Math.max(1, val), maxAmount));
                        }}
                        className="w-20 px-3 py-2 bg-neutral-900 text-white text-center 
                                 rounded-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                        min="1"
                        max={maxAmount}
                      />
                      <button
                        onClick={() => setAmount(Math.min(maxAmount, amount + 1))}
                        className="w-10 h-10 flex items-center justify-center bg-neutral-900 
                                 hover:bg-neutral-800 rounded-sm transition-colors"
                        disabled={amount >= maxAmount}
                      >
                        <span className="text-xl">+</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Fraction Price</span>
                      <span className="text-white">{property.pricePerFraction} OPN</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Quantity</span>
                      <span className="text-white">× {amount}</span>
                    </div>
                    <div className="pt-2 border-t border-neutral-800 flex justify-between">
                      <span className="text-white">Total Cost</span>
                      <span className="text-xl font-light text-white">{totalCost} OPN</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handlePurchase}
                    disabled={loading || amount <= 0 || amount > maxAmount}
                    className="w-full btn-primary flex items-center justify-center space-x-2 mt-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Purchase Fractions</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyModal;