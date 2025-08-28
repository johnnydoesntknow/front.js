// src/components/portfolio/PortfolioView.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useContract } from '../../hooks/useContract';
import { ethers } from 'ethers';
import { 
  TrendingUp, TrendingDown, PieChart, Activity, 
  Package, Clock, Loader2, DollarSign, BarChart3,
  ArrowUpRight, ArrowDownRight, Eye, Shield
} from 'lucide-react';

const PortfolioView = () => {
  const { isConnected, address } = useWeb3();
  const { fractionalization } = useContract();
  const [loading, setLoading] = useState(true);
  const [userAssets, setUserAssets] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

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
          
          const percentageOwned = (balance.mul(10000).div(assetDetails.totalSupply)).toNumber() / 100;
          const currentValue = ethers.utils.formatEther(assetDetails.pricePerFraction.mul(balance));
          
          return {
            tokenId: tokenId.toString(),
            balance: balance.toString(),
            assetName: request.assetName,
            assetType: request.assetType,
            assetImageUrl: request.assetImageUrl,
            location: request.location || "Dubai, UAE",
            pricePerFraction: ethers.utils.formatEther(assetDetails.pricePerFraction),
            totalValue: currentValue,
            percentageOwned,
            // Mock data for demo - in production, calculate from price history
            purchaseValue: parseFloat(currentValue) * 0.85,
            gain: parseFloat(currentValue) * 0.15,
            gainPercentage: 17.65
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
            tokenId: request.tokenId.toString(),
            requiresPurchaserKYC: request.requiresPurchaserKYC
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
  const totalGain = userAssets.reduce((sum, asset) => sum + asset.gain, 0);
  const totalAssets = userAssets.length;
  const pendingRequests = userRequests.filter(r => r.status === 0).length;
  
  // Calculate asset allocation
  const assetAllocation = userAssets.reduce((acc, asset) => {
    const type = asset.assetType || 'Other';
    if (!acc[type]) acc[type] = 0;
    acc[type] += parseFloat(asset.totalValue);
    return acc;
  }, {});

  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-neutral-400 font-normal">Connect your wallet to view your portfolio</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-neutral-500 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'holdings', label: `Holdings (${userAssets.length})` },
    { id: 'requests', label: `Requests (${userRequests.length})` },
    { id: 'analytics', label: 'Analytics' }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Circles - Same as Landing Page */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full border border-white/10"
          style={{ animation: 'pulseSlow 4s ease-in-out infinite' }}
        />
        <div 
          className="absolute top-20 -left-20 w-64 h-64 rounded-full border border-white/5"
          style={{ animation: 'rotateSlow 20s linear infinite' }}
        />
        <div 
          className="absolute bottom-20 right-40 w-32 h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute -bottom-64 -left-64 w-[32rem] h-[32rem] rounded-full border border-white/5"
          style={{ animation: 'rotateReverse 30s linear infinite' }}
        />
        <div 
          className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full blur-xl"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)',
            animation: 'floatAnimation 6s ease-in-out infinite',
            opacity: 0.5
          }}
        />
        <div 
          className="absolute top-1/3 left-1/4 w-24 h-24 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            animation: 'floatAnimation 8s ease-in-out infinite reverse'
          }}
        />
        <div 
          className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full border border-white/5"
          style={{ animation: 'pulseSlow 6s ease-in-out infinite' }}
        />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulseSlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotateReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes floatAnimation {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(10px) translateX(-10px); }
          75% { transform: translateY(-10px) translateX(20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.95); }
        }
      `}</style>

      {/* Main Content - Positioned above background */}
      <div className="relative" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Executive Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-white mb-2">Investment Portfolio</h1>
          <p className="text-neutral-400 font-light">
            Track performance and manage your tokenized asset holdings
          </p>
        </div>

        {/* Portfolio Value Card - Simplified without time metrics */}
        <div className="bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800 p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Total Value */}
            <div>
              <p className="text-xs font-normal uppercase tracking-widest text-neutral-500 mb-2">
                Total Portfolio Value
              </p>
              <div className="flex items-baseline gap-4 mb-4">
                <p className="text-2xl font-semibold text-white">{formatNumber(totalValue)}</p>
                <span className="text-lg font-normal text-neutral-400">OPN</span>
              </div>
              
              {/* Total Gain/Loss */}
              <div className="flex items-center gap-2">
                {totalGain >= 0 ? (
                  <>
                    <ArrowUpRight className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-normal">
                      +{formatNumber(totalGain)} OPN
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-normal">
                      {formatNumber(totalGain)} OPN
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-light text-neutral-500 mb-1">Total Assets</p>
                <p className="text-lg font-normal text-white">{totalAssets}</p>
              </div>
              <div>
                <p className="text-xs font-light text-neutral-500 mb-1">Pending Requests</p>
                <p className="text-lg font-normal text-white">{pendingRequests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-[1px] bg-neutral-900 mb-12">
          <div className="bg-black p-6">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-5 h-5 text-neutral-500" />
              <p className="text-xs font-normal uppercase tracking-widest text-neutral-500">
                Assets Owned
              </p>
            </div>
            <p className="text-2xl font-semibold text-white">{totalAssets}</p>
          </div>
          
          <div className="bg-black p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-neutral-500" />
              <p className="text-xs font-normal uppercase tracking-widest text-neutral-500">
                Total Gain
              </p>
            </div>
            <p className={`text-2xl font-semibold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}{formatNumber(totalGain)}
            </p>
          </div>
          
          <div className="bg-black p-6">
            <div className="flex items-center gap-3 mb-3">
              <PieChart className="w-5 h-5 text-neutral-500" />
              <p className="text-xs font-normal uppercase tracking-widest text-neutral-500">
                Avg. Ownership
              </p>
            </div>
            <p className="text-2xl font-semibold text-white">
              {totalAssets > 0 
                ? (userAssets.reduce((sum, a) => sum + a.percentageOwned, 0) / totalAssets).toFixed(2)
                : '0.00'
              }%
            </p>
          </div>
          
          <div className="bg-black p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-neutral-500" />
              <p className="text-xs font-normal uppercase tracking-widest text-neutral-500">
                Pending
              </p>
            </div>
            <p className="text-2xl font-semibold text-white">{pendingRequests}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-900 mb-8">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-4 text-sm transition-all duration-300 border-b-2
                  ${activeTab === tab.id 
                    ? 'text-white border-white font-semibold' 
                    : 'text-neutral-500 border-transparent hover:text-neutral-300 font-normal'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Asset Allocation */}
            <div className="lg:col-span-2 bg-black border border-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Asset Allocation</h3>
              <div className="space-y-4">
                {Object.entries(assetAllocation).map(([type, value]) => {
                  const percentage = (value / totalValue) * 100;
                  return (
                    <div key={type}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-normal text-neutral-300">{type}</span>
                        <span className="text-sm font-normal text-white">
                          {percentage.toFixed(1)}% • {formatNumber(value)} OPN
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-neutral-700 to-neutral-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-black border border-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                <div className="text-center py-8 text-neutral-500 font-light text-sm">
                  No recent transactions
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'holdings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userAssets.length === 0 ? (
              <div className="col-span-full text-center py-32">
                <Package className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500 font-normal text-lg">No assets in portfolio</p>
                <p className="text-neutral-600 font-light text-sm mt-2">
                  Visit the marketplace to acquire fractional ownership
                </p>
              </div>
            ) : (
              userAssets.map((asset) => (
                <div key={asset.tokenId} className="bg-black border border-neutral-900 overflow-hidden group hover:border-neutral-800 transition-all duration-500">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-950">
                    <img
                      src={asset.assetImageUrl}
                      alt={asset.assetName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
                      }}
                    />
                    
                    {/* Overlay with performance */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-sm">
                      <div className={`flex items-center gap-1 ${asset.gainPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.gainPercentage >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="text-xs font-normal">
                          {asset.gainPercentage >= 0 ? '+' : ''}{asset.gainPercentage.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <p className="text-xs font-normal uppercase tracking-widest text-neutral-500 mb-2">
                      {asset.assetType}
                    </p>
                    <h3 className="text-lg font-semibold text-white mb-1">{asset.assetName}</h3>
                    <p className="text-sm font-light text-neutral-500 mb-4">{asset.location}</p>
                    
                    {/* Ownership Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-light text-neutral-500">Ownership</span>
                        <span className="text-lg font-semibold text-white">{asset.percentageOwned.toFixed(3)}%</span>
                      </div>
                      
                      <div className="h-1 bg-neutral-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-neutral-700 to-neutral-600"
                          style={{ width: `${Math.min(asset.percentageOwned, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Value Metrics */}
                    <div className="space-y-2 pt-4 border-t border-neutral-900">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500 font-light">Current Value</span>
                        <span className="text-white font-normal">{formatNumber(asset.totalValue)} OPN</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500 font-light">Purchase Value</span>
                        <span className="text-neutral-400 font-normal">{formatNumber(asset.purchaseValue)} OPN</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500 font-light">Gain/Loss</span>
                        <span className={`font-normal ${asset.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {asset.gain >= 0 ? '+' : ''}{formatNumber(asset.gain)} OPN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {userRequests.length === 0 ? (
              <div className="text-center py-32">
                <Clock className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500 font-normal text-lg">No fractionalization requests</p>
                <p className="text-neutral-600 font-light text-sm mt-2">
                  Create a request to tokenize your assets
                </p>
              </div>
            ) : (
              userRequests.map((request) => (
                <div key={request.requestId} className="bg-black border border-neutral-900 p-6 hover:border-neutral-800 transition-colors">
                  <div className="flex items-start gap-6">
                    <img
                      src={request.assetImageUrl}
                      alt={request.assetName}
                      className="w-24 h-24 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80';
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-normal uppercase tracking-widest text-neutral-500 mb-2">
                            {request.assetType}
                          </p>
                          <h3 className="text-lg font-semibold text-white mb-1">{request.assetName}</h3>
                          <p className="text-sm font-light text-neutral-500">Request #{request.requestId}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {request.requiresPurchaserKYC && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-900/20 border border-amber-900/50 rounded-sm">
                              <Shield className="w-3 h-3 text-amber-400" />
                              <span className="text-xs font-normal text-amber-400">KYC Required</span>
                            </div>
                          )}
                          <span className={`
                            px-3 py-1 text-xs font-normal uppercase tracking-wider rounded-sm
                            ${request.status === 0 ? 'bg-amber-900/20 text-amber-400 border border-amber-900/50' :
                              request.status === 1 ? 'bg-green-900/20 text-green-400 border border-green-900/50' :
                              'bg-red-900/20 text-red-400 border border-red-900/50'
                            }
                          `}>
                            {request.status === 0 ? 'Pending' : request.status === 1 ? 'Approved' : 'Rejected'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-6 mt-6">
                        <div>
                          <p className="text-xs font-light text-neutral-500">Total Fractions</p>
                          <p className="text-white font-normal">{parseInt(request.totalFractions).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs font-light text-neutral-500">Price/Fraction</p>
                          <p className="text-white font-normal">{request.pricePerFraction} OPN</p>
                        </div>
                        <div>
                          <p className="text-xs font-light text-neutral-500">Total Value</p>
                          <p className="text-white font-normal">
                            {formatNumber(parseInt(request.totalFractions) * parseFloat(request.pricePerFraction))} OPN
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-light text-neutral-500">Created</p>
                          <p className="text-white font-normal">{request.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Chart Placeholder */}
            <div className="bg-black border border-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Portfolio Performance</h3>
              <div className="h-64 flex items-center justify-center text-neutral-600">
                <BarChart3 className="w-8 h-8" />
              </div>
              <p className="text-center text-sm font-light text-neutral-500 mt-4">
                Performance chart coming soon
              </p>
            </div>
            
            {/* Top Holdings */}
            <div className="bg-black border border-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Top Holdings by Value</h3>
              <div className="space-y-4">
                {userAssets
                  .sort((a, b) => parseFloat(b.totalValue) - parseFloat(a.totalValue))
                  .slice(0, 5)
                  .map((asset, index) => (
                    <div key={asset.tokenId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-light text-neutral-600 w-4">{index + 1}</span>
                        <div>
                          <p className="text-sm font-normal text-white">{asset.assetName}</p>
                          <p className="text-xs font-light text-neutral-500">{asset.percentageOwned.toFixed(3)}% owned</p>
                        </div>
                      </div>
                      <p className="text-sm font-normal text-white">{formatNumber(asset.totalValue)} OPN</p>
                    </div>
                    ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default PortfolioView;