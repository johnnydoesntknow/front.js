// src/components/marketplace/MarketplaceView.jsx
import React, { useState } from 'react';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useWeb3 } from '../../contexts/Web3Context';
import AssetCard from './AssetCard';
import BuyModal from './BuyModal';
import { Loader2 } from 'lucide-react';

const MarketplaceView = () => {
  const { assets, loading, error, purchaseFractions } = useMarketplace();
  const { isConnected } = useWeb3();
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  
  // Calculate metrics
  const totalValue = assets.reduce((sum, a) => {
    const value = parseFloat(a.pricePerFraction) * parseInt(a.totalFractions);
    return sum + value;
  }, 0);
  
  const totalFractions = assets.reduce((sum, a) => sum + parseInt(a.totalFractions), 0);
  const totalVolume = assets.reduce((sum, a) => sum + parseFloat(a.totalRevenue || 0), 0);

  const handlePurchase = async (tokenId, amount) => {
    try {
      await purchaseFractions(tokenId, amount);
      setShowBuyModal(false);
      // Success notification handled by AppContext
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-16 animate-fadeIn">
          <h1 className="heading-1 text-white mb-4">Marketplace</h1>
          <p className="body-text max-w-2xl">
            Discover and invest in fractionalized luxury assets on the OPN Network. 
            Each fraction represents partial ownership verified on-chain.
          </p>
        </div>

        {/* Connection Warning */}
        {!isConnected && (
          <div className="mb-8 p-4 bg-yellow-900/20 border border-yellow-900/50 rounded-sm">
            <p className="text-yellow-200 text-sm">
              Connect your wallet to view and purchase fractionalized assets
            </p>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-900 rounded-sm overflow-hidden mb-16">
          <div className="bg-black p-8">
            <p className="label-text mb-2">Total Value Locked</p>
            <p className="text-2xl font-light text-white">{totalValue.toFixed(2)} OPN</p>
          </div>
          <div className="bg-black p-8">
            <p className="label-text mb-2">Active Assets</p>
            <p className="text-2xl font-light text-white">{assets.length}</p>
          </div>
          <div className="bg-black p-8">
            <p className="label-text mb-2">Total Fractions</p>
            <p className="text-2xl font-light text-white">{totalFractions.toLocaleString()}</p>
          </div>
          <div className="bg-black p-8">
            <p className="label-text mb-2">Total Volume</p>
            <p className="text-2xl font-light text-white">{totalVolume.toFixed(2)} OPN</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-32">
            <p className="text-red-400 text-lg">Error loading assets: {error}</p>
          </div>
        )}

        {/* Assets Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map(asset => (
              <AssetCard 
                key={asset.tokenId} 
                asset={asset}
                onBuyClick={(asset) => {
                  setSelectedAsset(asset);
                  setShowBuyModal(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && assets.length === 0 && (
          <div className="text-center py-32">
            <p className="text-neutral-500 text-lg font-light">
              No fractionalized assets available yet. Be the first to create one!
            </p>
          </div>
        )}
      </div>

      {/* Buy Modal */}
      {showBuyModal && selectedAsset && (
        <BuyModal 
          asset={selectedAsset}
          onClose={() => setShowBuyModal(false)}
          onPurchase={handlePurchase}
        />
      )}
    </div>
  );
};

export default MarketplaceView;