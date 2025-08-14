// src/components/portfolio/PortfolioView.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useContract } from '../../hooks/useContract';
import { ethers } from 'ethers';
import { TrendingUp, Package, Clock, Loader2 } from 'lucide-react';

const PortfolioView = () => {
  const { isConnected, address } = useWeb3();
  const { fractionalization } = useContract();
  const [loading, setLoading] = useState(true);
  const [userAssets, setUserAssets] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('holdings');

  // Fetch user's holdings and requests
  useEffect(() => {
    const fetchUserData = async () => {
      if (!fractionalization || !address || !isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get user's token holdings
        const userTokenIds = await fractionalization.getUserTokens(address);
        
        // Fetch details for each token
        const holdingsPromises = userTokenIds.map(async (tokenId) => {
          const balance = await fractionalization.balanceOf(address, tokenId);
          if (balance.toString() === '0') return null;

          const assetDetails = await fractionalization.assetDetails(tokenId);
          const request = await fractionalization.requests(assetDetails.requestId);
          
          return {
            tokenId: tokenId.toString(),
            balance: balance.toString(),
            assetName: request.assetName,
            assetType: request.assetType,
            assetImageUrl: request.assetImageUrl,
            pricePerFraction: ethers.utils.formatEther(assetDetails.pricePerFraction),
            totalValue: ethers.utils.formatEther(assetDetails.pricePerFraction.mul(balance)),
            percentageOwned: (balance.mul(10000).div(assetDetails.totalSupply)).toNumber() / 100
          };
        });

        const holdings = (await Promise.all(holdingsPromises)).filter(h => h !== null);

        // Get user's fractionalization requests
        const requestIds = await fractionalization.getUserRequests(address);
        
        const requestsPromises = requestIds.map(async (requestId) => {
          const request = await fractionalization.requests(requestId);
          
          return {
            requestId: requestId.toString(),
            assetName: request.assetName,
            assetType: request.assetType,
            assetImageUrl: request.assetImageUrl,
            totalFractions: request.totalFractions.toString(),
            pricePerFraction: ethers.utils.formatEther(request.pricePerFraction),
            status: request.status,
            timestamp: new Date(request.timestamp.toNumber() * 1000).toLocaleDateString(),
            tokenId: request.tokenId.toString()
          };
        });

        const requests = await Promise.all(requestsPromises);

        setUserAssets(holdings);
        setUserRequests(requests);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [fractionalization, address, isConnected]);

  // Calculate portfolio metrics
  const totalValue = userAssets.reduce((sum, asset) => sum + parseFloat(asset.totalValue), 0);
  const totalAssets = userAssets.length;
  const pendingRequests = userRequests.filter(r => r.status === 0).length;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="heading-2 text-white mb-4">Connect Your Wallet</h2>
          <p className="body-text">Connect your wallet to view your portfolio</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-16">
          <h1 className="heading-1 text-white mb-4">Portfolio</h1>
          <p className="body-text">Manage your fractionalized assets and track performance</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-neutral-500" />
              <span className="text-xs uppercase tracking-wider text-neutral-500">Total Value</span>
            </div>
            <p className="text-3xl font-light text-white">{totalValue.toFixed(2)} OPN</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-neutral-500" />
              <span className="text-xs uppercase tracking-wider text-neutral-500">Assets Owned</span>
            </div>
            <p className="text-3xl font-light text-white">{totalAssets}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-neutral-500" />
              <span className="text-xs uppercase tracking-wider text-neutral-500">Pending Requests</span>
            </div>
            <p className="text-3xl font-light text-white">{pendingRequests}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('holdings')}
            className={`px-6 py-3 text-sm font-light transition-all duration-200 ${
              activeTab === 'holdings'
                ? 'text-white border-b-2 border-white'
                : 'text-neutral-500 hover:text-white border-b-2 border-transparent'
            }`}
          >
            Holdings ({userAssets.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 text-sm font-light transition-all duration-200 ${
              activeTab === 'requests'
                ? 'text-white border-b-2 border-white'
                : 'text-neutral-500 hover:text-white border-b-2 border-transparent'
            }`}
          >
            Requests ({userRequests.length})
          </button>
        </div>

        {/* Holdings Tab */}
        {activeTab === 'holdings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userAssets.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-neutral-500 text-lg">You don't own any fractionalized assets yet</p>
              </div>
            ) : (
              userAssets.map((asset) => (
                <div key={asset.tokenId} className="card">
                  <div className="aspect-square bg-neutral-950 overflow-hidden">
                    <img
                      src={asset.assetImageUrl}
                      alt={asset.assetName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800&q=80';
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <p className="label-text mb-2">{asset.assetType}</p>
                    <h3 className="text-lg font-normal text-white mb-4">{asset.assetName}</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Fractions Owned</span>
                        <span className="text-white">{asset.balance}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Ownership</span>
                        <span className="text-white">{asset.percentageOwned.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Current Value</span>
                        <span className="text-white">{asset.totalValue} OPN</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-neutral-900">
                      <p className="text-xs text-neutral-500">Price per fraction</p>
                      <p className="text-white">{asset.pricePerFraction} OPN</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {userRequests.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-neutral-500 text-lg">You haven't created any fractionalization requests</p>
              </div>
            ) : (
              userRequests.map((request) => (
                <div key={request.requestId} className="card p-6">
                  <div className="flex items-start space-x-6">
                    <img
                      src={request.assetImageUrl}
                      alt={request.assetName}
                      className="w-24 h-24 object-cover rounded-sm"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800&q=80';
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="label-text mb-2">{request.assetType}</p>
                          <h3 className="text-lg font-normal text-white mb-1">{request.assetName}</h3>
                          <p className="text-sm text-neutral-500">Request #{request.requestId}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs uppercase tracking-wider rounded-sm ${
                          request.status === 0 ? 'bg-yellow-900/20 text-yellow-200 border border-yellow-900/50' :
                          request.status === 1 ? 'bg-green-900/20 text-green-200 border border-green-900/50' :
                          'bg-red-900/20 text-red-200 border border-red-900/50'
                        }`}>
                          {request.status === 0 ? 'Pending' : request.status === 1 ? 'Approved' : 'Rejected'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-6 mt-4">
                        <div>
                          <p className="text-xs text-neutral-500">Total Fractions</p>
                          <p className="text-white">{request.totalFractions}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Price/Fraction</p>
                          <p className="text-white">{request.pricePerFraction} OPN</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Total Value</p>
                          <p className="text-white">
                            {(parseInt(request.totalFractions) * parseFloat(request.pricePerFraction)).toFixed(2)} OPN
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Created</p>
                          <p className="text-white">{request.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioView;