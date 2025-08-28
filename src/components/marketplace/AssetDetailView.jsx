// src/components/marketplace/AssetDetailView.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, Shield, MapPin, Calendar, Users, Activity, 
  TrendingUp, FileText, Home, Maximize, DollarSign,
  Clock, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { useMarketplace } from '../../hooks/useMarketplace';
import BuyModal from './BuyModal';

const AssetDetailView = ({ asset, onBack }) => {
  const { purchaseShares } = useMarketplace();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
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
  
  // Calculate metrics
  const totalValue = parseFloat(asset.pricePerShare || 0) * parseInt(asset.totalShares || 0);
const soldPercentage = asset.totalShares > 0 
  ? ((parseInt(asset.totalShares) - parseInt(asset.availableShares)) / parseInt(asset.totalShares)) * 100
  : 0;
const availablePercentage = asset.totalShares > 0
  ? (parseInt(asset.availableShares) / parseInt(asset.totalShares)) * 100
  : 0;
  
  // Format numbers professionally
  const formatNumber = (num) => parseFloat(num).toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  
  // Mock additional data (in real app, this would come from API)
  const assetDetails = {
    description: asset.assetDescription || "Premium asset tokenized on OPN's ATLAS protocol, offering fractional ownership with full transparency and security.",
    location: asset.location || "Dubai, United Arab Emirates",
    yearBuilt: "2023",
    size: "3,500 sq ft",
    features: ["Sea View", "Private Pool", "Smart Home", "24/7 Security"],
    documents: [
      { name: "Title Deed", status: "verified", date: "2024-12-15" },
      { name: "Valuation Report", status: "verified", date: "2024-12-10" },
      { name: "Legal Opinion", status: "verified", date: "2024-12-08" },
      { name: "Insurance Policy", status: "pending", date: "2025-01-01" }
    ],
    transactions: [
      { type: "purchase", amount: "5.00%", value: "250,000 OPN", date: "2025-01-14", buyer: "0x742d...5c1b" },
      { type: "purchase", amount: "2.50%", value: "125,000 OPN", date: "2025-01-13", buyer: "0x8f3a...2d4e" },
      { type: "purchase", amount: "10.00%", value: "500,000 OPN", date: "2025-01-12", buyer: "0x1a2b...3c4d" },
      { type: "purchase", amount: "1.00%", value: "50,000 OPN", date: "2025-01-11", buyer: "0x9e8f...7a6b" }
    ]
  };
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Shield },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header Navigation */}
      <div className="border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-400 hover:text-white font-normal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </button>
        </div>
      </div>
      
      {/* Hero Section with Image */}
      <div className="relative h-[400px] overflow-hidden">
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
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-xs font-normal text-white/80 rounded-sm">
                    {asset.assetType}
                  </span>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-400" />
                    <span className="text-xs font-light text-green-400">Verified Asset</span>
                  </div>
                </div>
                <h1 className="text-4xl font-semibold text-white mb-2">{asset.assetName}</h1>
                <div className="flex items-center gap-2 text-neutral-300">
                  <MapPin className="w-4 h-4" />
                  <span className="font-normal">{assetDetails.location}</span>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="bg-black/60 backdrop-blur-sm p-6 rounded-sm">
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
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="border-b border-neutral-900">
              <nav className="flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-6 py-4 
                        transition-all duration-300 border-b-2
                        ${isActive 
                          ? 'text-white border-white font-semibold' 
                          : 'text-neutral-500 border-transparent hover:text-neutral-300 font-normal'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
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
                      {assetDetails.description}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Key Features</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {assetDetails.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-neutral-300 font-normal">{feature}</span>
                        </div>
                      ))}
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
                        <p className="text-lg font-semibold text-white">24</p>
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
                      <p className="text-xs font-light text-neutral-500 mb-2">Property Type</p>
                      <p className="text-white font-normal">{asset.assetType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-light text-neutral-500 mb-2">Year Built</p>
                      <p className="text-white font-normal">{assetDetails.yearBuilt}</p>
                    </div>
                    <div>
                      <p className="text-xs font-light text-neutral-500 mb-2">Size</p>
                      <p className="text-white font-normal">{assetDetails.size}</p>
                    </div>
                    <div>
                      <p className="text-xs font-light text-neutral-500 mb-2">Location</p>
                      <p className="text-white font-normal">{assetDetails.location}</p>
                    </div>
                    <div>
  <p className="text-xs font-light text-neutral-500 mb-2">Total Shares</p>
  <p className="text-white font-normal">{parseInt(asset.totalShares || 0).toLocaleString()}</p>
</div>
                    <div>
                      <p className="text-xs font-light text-neutral-500 mb-2">Contract Address</p>
                      <p className="text-white font-normal font-mono text-sm">
                        {asset.contractAddress?.slice(0, 6)}...{asset.contractAddress?.slice(-4)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  {assetDetails.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-neutral-900 hover:border-neutral-800 transition-colors">
                      <div className="flex items-center gap-4">
                        <FileText className="w-5 h-5 text-neutral-500" />
                        <div>
                          <p className="text-white font-normal">{doc.name}</p>
                          <p className="text-xs font-light text-neutral-500">Uploaded {doc.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === 'verified' ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-xs font-normal text-green-400">Verified</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-normal text-amber-400">Pending</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {assetDetails.transactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-neutral-900">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-normal">
                            {tx.amount} purchased by {tx.buyer}
                          </p>
                          <p className="text-xs font-light text-neutral-500">{tx.date}</p>
                        </div>
                      </div>
                      <p className="text-white font-normal">{tx.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-black border border-neutral-900 rounded-sm">
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
                    <span className="font-light">ATLAS Protocol Compliant</span>
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
        <BuyModal 
          asset={asset}
          onClose={() => setShowBuyModal(false)}
          onPurchase={purchaseShares}
        />
      )}
    </div>
  );
};

export default AssetDetailView;