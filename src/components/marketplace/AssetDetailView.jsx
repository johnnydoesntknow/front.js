import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Shield, MapPin, Calendar, Users, Activity, 
  TrendingUp, FileText, Home, Maximize, DollarSign,
  Clock, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useContract } from '../../hooks/useContract';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';
import PropertyModal from '../property/PropertyModal';
import { useApp } from '../../contexts/AppContext';

const AssetDetailView = ({ asset, onBack }) => {
  const { purchaseShares } = useMarketplace();
  const { fractionalization } = useContract();
  const { address } = useWeb3();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [holders, setHolders] = useState([]);
  const { showNotification } = useApp();
  
  if (!asset) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 font-normal mb-4">Asset not found</p>
          <button 
            onClick={onBack}
            className="text-white hover:text-neutral-300 font-normal transition-colors"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }
  

  // Fetch transaction history and investor data
useEffect(() => {
  const fetchTransactions = async () => {
    if (!fractionalization || !asset?.assetId) {
      setLoadingTransactions(false);
      return;
    }
    
    try {
      setLoadingTransactions(true);
      console.log('Fetching data for asset:', asset.assetId);
      
      // Call contract methods directly to get investor data
      try {
        // Get the list of investors for this asset
        const investors = await fractionalization.getAssetInvestors(asset.assetId);
        console.log('Found investors:', investors);
        
        if (investors && investors.length > 0) {
          setHolders(investors);
          
          // For each investor, get their share data
          const txList = [];
          for (const investor of investors) {
            try {
              const shares = await fractionalization.getUserShares(investor, asset.assetId);
              const ownershipData = await fractionalization.getUserOwnershipPercentage(investor, asset.assetId);
              
              console.log(`Investor ${investor} has ${shares.toString()} shares`);
              
              if (shares && shares.gt(0)) {
  // Convert pricePerShare to BigNumber properly
  const pricePerShareBN = ethers.utils.parseEther(asset.pricePerShare.toString());
  
  // Calculate the cost: (shares * pricePerShare) / PRICE_PRECISION
  // Note: PRICE_PRECISION in the contract is 1e18
  const totalCost = shares.mul(pricePerShareBN).div(ethers.utils.parseEther("1"));
  
  txList.push({
    type: 'purchase',
    amount: `${(ownershipData.percentage.toNumber() / 100).toFixed(3)}%`,
    value: ethers.utils.formatEther(totalCost),
    date: asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
    buyer: `${investor.slice(0, 6)}...${investor.slice(-4)}`,
    fullBuyer: investor.toLowerCase(),
    txHash: '0x...', // We don't have tx hash from this method
    blockNumber: 0
  });
}
            } catch (err) {
              console.error('Error getting shares for investor:', investor, err);
            }
          }
          
          if (txList.length > 0) {
            setTransactions(txList);
            console.log('Successfully loaded transactions:', txList);
          } else {
            console.log('No transactions found');
            setTransactions([]);
          }
        } else {
          console.log('No investors found for this asset');
          setTransactions([]);
          setHolders([]);
        }
      } catch (err) {
        console.error('Error calling contract methods:', err);
        setTransactions([]);
        setHolders([]);
      }
      
    } catch (error) {
      console.error('Error in transaction fetch:', error);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };
  
  fetchTransactions();
}, [fractionalization, asset?.assetId]); // Only depend on stable properties
  
  // Calculate real metrics
  const totalShares = parseInt(asset.totalShares || 0);
  const availableShares = parseInt(asset.availableShares || 0);
  const soldShares = totalShares - availableShares;
  const totalValue = parseFloat(asset.pricePerShare || 0) * totalShares;
  const soldPercentage = totalShares > 0 ? (soldShares / totalShares) * 100 : 0;
  const availablePercentage = totalShares > 0 ? (availableShares / totalShares) * 100 : 0;
  
  // Format numbers
  const formatNumber = (num) => parseFloat(num).toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Shield },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header Navigation */}
      {/* Header Navigation */}
<div className="border-b border-neutral-900">
  <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-neutral-400 hover:text-white font-normal transition-colors pl-14 lg:pl-0"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back to Marketplace</span>
    </button>
  </div>
</div>
      
      {/* Hero Section with Image */}
<div className="relative h-[300px] sm:h-[400px] overflow-hidden">
  <img 
    src={asset.assetImageUrl} 
    alt={asset.assetName}
    className="w-full h-full object-cover"
    onError={(e) => {
      e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80';
    }}
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
  
  {/* Asset Title Overlay */}
  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-xs font-normal text-white/80 rounded-sm">
              {asset.assetType}
            </span>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-400" />
              <span className="text-xs font-light text-green-400">Verified Asset</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold text-white mb-2">{asset.assetName}</h1>
          <div className="flex items-center gap-2 text-neutral-300">
            <MapPin className="w-4 h-4" />
            <span className="font-normal text-sm sm:text-base">Dubai, United Arab Emirates</span>
          </div>
        </div>
        
        {/* Quick Stats - Hidden on mobile, shown in card below */}
        <div className="hidden sm:block bg-black/60 backdrop-blur-sm p-6 rounded-sm">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-light text-neutral-400 mb-1">Total Value</p>
              <p className="text-xl font-semibold text-white">{formatNumber(totalValue)} OPN</p>
            </div>
            <div>
              <p className="text-xs font-light text-neutral-400 mb-1">Available</p>
              <p className="text-xl font-semibold text-white">{availablePercentage.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Mobile Stats - Show below hero on mobile */}
<div className="sm:hidden px-4 py-4 bg-neutral-950 border-b border-neutral-900">
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="text-xs font-light text-neutral-400 mb-1">Total Value</p>
      <p className="text-lg font-semibold text-white">{formatNumber(totalValue)} OPN</p>
    </div>
    <div>
      <p className="text-xs font-light text-neutral-400 mb-1">Available</p>
      <p className="text-lg font-semibold text-white">{availablePercentage.toFixed(2)}%</p>
    </div>
  </div>
</div>
      
   
{/* Main Content */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Left Column - Details */}
    <div className="col-span-1 lg:col-span-2 space-y-8">
      {/* Tabs - Fixed for mobile */}
      <div className="border-b border-neutral-900 overflow-x-auto">
        <nav className="flex gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3 sm:px-4 py-3 whitespace-nowrap
                  transition-all duration-300 border-b-2
                  ${isActive 
                    ? 'text-white border-white font-semibold' 
                    : 'text-neutral-500 border-transparent hover:text-neutral-300 font-normal'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm sm:text-base">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
            
            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">About this Asset</h3>
                    <p className="text-neutral-400 font-normal leading-relaxed">
                      {asset.assetDescription || "Premium tokenized asset on OPN's platform, offering fractional ownership with full transparency and security."}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Key Features</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-neutral-300 font-normal">Sea View</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-neutral-300 font-normal">Private Pool</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-neutral-300 font-normal">Smart Home</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-neutral-300 font-normal">24/7 Security</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Investment Metrics</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-neutral-950 border border-neutral-900 p-4">
                        <p className="text-xs font-light text-neutral-500 mb-2">Price per 1%</p>
                        <p className="text-lg font-semibold text-white">
                          {formatNumber(totalValue / 100)} OPN
                        </p>
                      </div>
                      <div className="bg-neutral-950 border border-neutral-900 p-4">
                        <p className="text-xs font-light text-neutral-500 mb-2">Holders</p>
                        <p className="text-lg font-semibold text-white">{holders.length || 1}</p>
                      </div>
                      <div className="bg-neutral-950 border border-neutral-900 p-4">
                        <p className="text-xs font-light text-neutral-500 mb-2">Min. Investment</p>
                        <p className="text-lg font-semibold text-white">0.001%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-light text-neutral-500 mb-2">Asset Type</p>
                      <p className="text-white font-normal">{asset.assetType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-light text-neutral-500 mb-2">Asset ID</p>
                      <p className="text-white font-normal">#{asset.assetId}</p>
                    </div>
                    <div>
                      <p className="text-xs font-light text-neutral-500 mb-2">Total Shares</p>
                      <p className="text-white font-normal">{parseInt(asset.totalShares).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-light text-neutral-500 mb-2">Available Shares</p>
                      <p className="text-white font-normal">{parseInt(asset.availableShares).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-light text-neutral-500 mb-2">Creator</p>
                      <p className="text-white font-normal font-mono text-sm">
                        {asset.creator?.slice(0, 6)}...{asset.creator?.slice(-4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-light text-neutral-500 mb-2">Created</p>
                      <p className="text-white font-normal">{asset.createdAt}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-neutral-900">
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-neutral-500" />
                      <div>
                        <p className="text-white font-normal">Title Deed</p>
                        <p className="text-xs font-light text-neutral-500">Uploaded on creation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-normal text-green-400">Verified</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-neutral-900">
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-neutral-500" />
                      <div>
                        <p className="text-white font-normal">Smart Contract</p>
                        <p className="text-xs font-light text-neutral-500">Deployed on-chain</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-normal text-green-400">Verified</span>
                    </div>
                  </div>
                  
                  <div className="text-center py-8 text-xs text-neutral-500">
                    Additional documents will be available after compliance review
                  </div>
                </div>
              )}
              
              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {loadingTransactions ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 text-neutral-500 animate-spin" />
                    </div>
                  ) : transactions.length > 0 ? (
                    transactions.map((tx, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-neutral-900">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-white font-normal">
                              {tx.amount} purchased by {(address && tx.fullBuyer === address.toLowerCase()) ? 'You' : tx.buyer}
                            </p>
                            <p className="text-xs font-light text-neutral-500">{tx.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-normal">{formatNumber(tx.value)} OPN</p>
                          {tx.txHash !== '0x...' && (
                            <a 
                              href={`https://testnet.opn.network/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-neutral-500 hover:text-neutral-300"
                            >
                              View tx
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-neutral-500 mb-2">No transactions recorded yet</p>
                      <p className="text-xs text-neutral-600">
                        {soldPercentage > 0 ? 'Transaction history may take a moment to sync' : 'Be the first to invest in this asset'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Purchase Card (Non-sticky on smaller screens) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 bg-black border border-neutral-900 rounded-sm">
              <div className="p-6 border-b border-neutral-900">
                <h3 className="text-lg font-semibold text-white mb-4">Ownership Distribution</h3>
                
                {/* Ownership Chart */}
                <div className="relative h-2 bg-neutral-900 rounded-full overflow-hidden mb-4">
                  <div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-neutral-700 to-neutral-600"
                    style={{ width: `${soldPercentage}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-neutral-500 font-light">Sold</p>
                    <p className="text-white font-normal">{soldPercentage.toFixed(2)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-500 font-light">Available</p>
                    <p className="text-white font-normal">{availablePercentage.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-light text-neutral-500 mb-1">Price per Share</p>
                  <p className="text-2xl font-semibold text-white">{asset.pricePerShare} OPN</p>
                </div>
                
                {asset.requiresPurchaserKYC && (
                  <div className="flex items-start gap-2 p-3 bg-amber-900/10 border border-amber-900/30 rounded-sm">
                    <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-400">KYC Required</p>
                      <p className="text-xs font-light text-amber-400/70 mt-1">
                        Identity verification required for this asset
                      </p>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setShowBuyModal(true)}
                  className="w-full py-3 bg-white text-black font-normal rounded-sm
                           hover:bg-neutral-100 transition-all duration-300
                           flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Acquire Ownership</span>
                </button>
                
                <div className="pt-4 space-y-3 text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    <span className="font-light">Verified on OPN Chain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    <span className="font-light">Smart Contract Secured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    <span className="font-light">24/7 Trading Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Buy Modal */}
      {showBuyModal && (
  <PropertyModal 
    property={asset}  // PropertyModal expects 'property' not 'asset'
    onClose={() => setShowBuyModal(false)}
  />
)}
    </div>
  );
};

export default AssetDetailView;