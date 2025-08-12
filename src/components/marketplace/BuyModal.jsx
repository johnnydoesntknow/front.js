// src/components/marketplace/BuyModal.jsx
import React, { useState } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const BuyModal = ({ asset, onClose, onPurchase }) => {
  const { showNotification } = useApp();
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const totalCost = (parseFloat(asset.pricePerFraction) * amount).toFixed(4);
  const maxAmount = parseInt(asset.availableFractions);
  
  const handlePurchase = async () => {
    try {
      setLoading(true);
      await onPurchase(asset.tokenId, amount);
      showNotification(`Successfully purchased ${amount} fractions of ${asset.assetName}!`, 'success');
      onClose();
    } catch (error) {
      console.error('Purchase error:', error);
      let errorMessage = 'Transaction failed. Please try again.';
      
      if (error.message.includes('KYC')) {
        errorMessage = 'KYC verification required to purchase this asset.';
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
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-black border border-neutral-900 rounded-sm max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-900">
          <h2 className="text-xl font-normal text-white">Purchase Fractions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-900 rounded-sm transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Asset Info */}
          <div className="flex items-start space-x-4">
            <img 
              src={asset.assetImageUrl} 
              alt={asset.assetName}
              className="w-20 h-20 object-cover rounded-sm"
            />
            <div className="flex-1">
              <p className="label-text mb-1">{asset.assetType}</p>
              <h3 className="text-white font-normal mb-1">{asset.assetName}</h3>
              <p className="text-sm text-neutral-500">
                {asset.availableFractions} fractions available
              </p>
            </div>
          </div>

          {/* KYC Warning */}
          {asset.requiresPurchaserKYC && (
            <div className="flex items-start space-x-3 p-4 bg-yellow-900/20 border border-yellow-900/50 rounded-sm">
              <AlertCircle className="w-5 h-5 text-yellow-200 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-200">
                <p className="font-medium mb-1">KYC Required</p>
                <p className="text-yellow-200/80">
                  This asset requires KYC verification to purchase. 
                  Ensure your wallet is verified before proceeding.
                </p>
              </div>
            </div>
          )}

          {/* Amount Selection */}
          <div>
            <label className="label-text block mb-3">Number of Fractions</label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAmount(Math.max(1, amount - 1))}
                className="w-10 h-10 border border-neutral-800 hover:bg-neutral-900 
                         rounded-sm transition-colors flex items-center justify-center"
                disabled={loading}
              >
                -
              </button>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setAmount(Math.min(Math.max(1, val), maxAmount));
                }}
                className="input-field w-24 text-center"
                min="1"
                max={maxAmount}
                disabled={loading}
              />
              <button
                onClick={() => setAmount(Math.min(maxAmount, amount + 1))}
                className="w-10 h-10 border border-neutral-800 hover:bg-neutral-900 
                         rounded-sm transition-colors flex items-center justify-center"
                disabled={loading}
              >
                +
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Max: {maxAmount} fractions
            </p>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3 p-4 bg-neutral-950 rounded-sm">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Price per fraction</span>
              <span className="text-white">{asset.pricePerFraction} OPN</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Quantity</span>
              <span className="text-white">× {amount}</span>
            </div>
            <div className="h-px bg-neutral-800" />
            <div className="flex justify-between">
              <span className="text-white">Total Cost</span>
              <span className="text-white font-medium">{totalCost} OPN</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-neutral-900">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            className="btn-primary flex items-center space-x-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Purchase</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;