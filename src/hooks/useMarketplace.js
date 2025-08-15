// src/hooks/useMarketplace.js
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useContract } from './useContract';
import { useWeb3 } from '../contexts/Web3Context';

export const useMarketplace = () => {
  const { fractionalization } = useContract();
  const { isConnected } = useWeb3();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all active assets
  const fetchAssets = useCallback(async () => {
    if (!fractionalization || !isConnected) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get active assets token IDs
      const activeAssetIds = await fractionalization.getActiveAssets();
      
      // Fetch details for each asset
      const assetPromises = activeAssetIds.map(async (tokenId) => {
        const assetDetails = await fractionalization.assetDetails(tokenId);
        const requestId = assetDetails.requestId;
        const request = await fractionalization.requests(requestId);
        
        return {
          tokenId: tokenId.toString(),
          requestId: requestId.toString(),
          proposer: request.proposer,
          assetType: request.assetType,
          assetName: request.assetName,
          assetDescription: request.assetDescription,
          assetImageUrl: request.assetImageUrl,
          totalFractions: assetDetails.totalSupply.toString(),
          availableFractions: assetDetails.availableSupply.toString(),
                      pricePerFraction: ethers.utils.formatEther(assetDetails.pricePerFraction),
          requiresPurchaserKYC: assetDetails.requiresPurchaserKYC,
          isActive: assetDetails.isActive,
                      totalRevenue: ethers.utils.formatEther(assetDetails.totalRevenue),
          status: 1, // Approved (since we're fetching active assets)
          timestamp: request.timestamp.toString()
        };
      });

      const fetchedAssets = await Promise.all(assetPromises);
      setAssets(fetchedAssets);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fractionalization, isConnected]);

  // Purchase fractions
  const purchaseFractions = async (tokenId, amount) => {
    if (!fractionalization) throw new Error('Contract not connected');

    try {
      const asset = assets.find(a => a.tokenId === tokenId);
      if (!asset) throw new Error('Asset not found');

      const totalCost = ethers.utils.parseEther(asset.pricePerFraction).mul(amount);
      
      const tx = await fractionalization.purchaseFractions(tokenId, amount, {
        value: totalCost
      });

      await tx.wait();
      
      // Refresh assets after purchase
      await fetchAssets();
      
      return tx;
    } catch (err) {
      console.error('Purchase error:', err);
      throw err;
    }
  };

  // Get user's balance for a specific asset
  const getUserBalance = async (userAddress, tokenId) => {
    if (!fractionalization || !userAddress) return '0';
    
    try {
      const balance = await fractionalization.balanceOf(userAddress, tokenId);
      return balance.toString();
    } catch (err) {
      console.error('Error fetching balance:', err);
      return '0';
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Listen for purchase events
  useEffect(() => {
    if (!fractionalization) return;

    const handlePurchase = (tokenId, buyer, amount, totalCost) => {
      console.log('Purchase event:', { tokenId, buyer, amount, totalCost });
      // Refresh assets when a purchase is made
      fetchAssets();
    };

    fractionalization.on('FractionsPurchased', handlePurchase);

    return () => {
      fractionalization.off('FractionsPurchased', handlePurchase);
    };
  }, [fractionalization, fetchAssets]);

  return {
    assets,
    loading,
    error,
    purchaseFractions,
    getUserBalance,
    refreshAssets: fetchAssets
  };
};