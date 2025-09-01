// src/components/property/PropertyDetailView.jsx
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
import PropertyModal from './PropertyModal';
import { useApp } from '../../contexts/AppContext';

const PropertyDetailView = ({ property, onBack }) => {
  const { purchaseShares } = useMarketplace();
  const { fractionalization } = useContract();
  const { address } = useWeb3();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [holders, setHolders] = useState([]);
  const { showNotification } = useApp();
  
  if (!property) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 font-normal mb-4">Property not found</p>
          <button 
            onClick={onBack}
            className="text-white hover:text-neutral-300 font-normal transition-colors"
          >
            Return to Properties
          </button>
        </div>
      </div>
    );
  }
  
  // Fetch transaction history
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!fractionalization || !property?.assetId) {
        setLoadingTransactions(false);
        return;
      }
      
      try {
        setLoadingTransactions(true);
        // Fetch transaction data here
        setLoadingTransactions(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoadingTransactions(false);
      }
    };
    
    fetchTransactions();
  }, [fractionalization, property?.assetId]);
  
  // Calculate metrics
  const totalShares = parseInt(property.totalShares || 0);
  const availableShares = parseInt(property.availableShares || 0);
  const soldShares = totalShares - availableShares;
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
      <div className="border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-400 hover:text-white font-normal transition-colors pl-14 lg:pl-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Properties</span>
          </button>
        </div>
      </div>
      
      {/* Hero Section with Image */}
      <div className="relative h-[300px] sm:h-[400px] overflow-hidden">
        <img 
          src={property.assetImageUrl} 
          alt={property.assetName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Asset Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-xs font-normal text-white/80 rounded-sm">
                    {property.assetType || 'Land'}
                  </span>
                  {property.isVerified && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-900/30 backdrop-blur-sm text-xs font-normal text-green-400 rounded-sm">
                      <CheckCircle className="w-3 h-3" />
                      Verified Asset
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-2">
                  {property.assetName}
                </h1>
                <div className="flex items-center gap-2 text-white/70">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{property.location || 'Dubai, United Arab Emirates'}</span>
                </div>
              </div>
              
              {/* Quick Stats on Hero */}
              <div className="hidden lg:flex items-center gap-6 bg-black/60 backdrop-blur-sm px-6 py-3 rounded-sm">
                <div>
                  <p className="text-xs text-white/60">Total Value</p>
                  <p className="text-lg font-semibold text-white">{formatNumber(parseFloat(property.pricePerShare) * totalShares)} OPN</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Available</p>
                  <p className="text-lg font-semibold text-green-400">{availablePercentage.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-neutral-800 mb-8">
              <nav className="flex gap-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 pb-4 px-1 font-normal text-sm transition-all duration-200
                        ${activeTab === tab.id 
                          ? 'text-white border-b-2 border-white' 
                          : 'text-neutral-500 hover:text-neutral-300 border-b-2 border-transparent'
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
            <div className="space-y-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">About this Asset</h2>
                    <p className="text-neutral-400 font-light leading-relaxed">
                      {property.assetDescription || 'Field of dreams for a dream home.'}
                    </p>
                  </div>
                  
                  {/* Key Features */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Key Features</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Sea View</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Private Pool</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Smart Home</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>24/7 Security</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Investment Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Investment Metrics</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-neutral-950 border border-neutral-900 p-4">
                        <p className="text-xs text-neutral-500 mb-1">Price per 1%</p>
                        <p className="text-xl font-semibold text-white">{property.pricePerShare} OPN</p>
                      </div>
                      <div className="bg-neutral-950 border border-neutral-900 p-4">
                        <p className="text-xs text-neutral-500 mb-1">Holders</p>
                        <p className="text-xl font-semibold text-white">{holders.length || 1}</p>
                      </div>
                      <div className="bg-neutral-950 border border-neutral-900 p-4">
                        <p className="text-xs text-neutral-500 mb-1">Min. Investment</p>
                        <p className="text-xl font-semibold text-white">0.001%</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="bg-neutral-950 border border-neutral-900 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Property Information</h3>
                    <div className="grid grid-cols-2 gap-y-4">
                      <div>
                        <p className="text-xs text-neutral-500">Asset Type</p>
                        <p className="text-white">{property.assetType || 'Land'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Asset ID</p>
                        <p className="text-white">#{property.assetId || '4'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Total Shares</p>
                        <p className="text-white">{property.totalShares}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Available Shares</p>
                        <p className="text-white">{property.availableShares}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Creator</p>
                        <p className="text-white font-mono text-sm">
                          {property.creator ? `${property.creator.slice(0, 6)}...${property.creator.slice(-4)}` : '...'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Created</p>
                        <p className="text-white">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="bg-neutral-950 border border-neutral-900 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Documents</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-black border border-neutral-800 rounded-sm">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-neutral-400" />
                          <div>
                            <p className="text-white">Title Deed</p>
                            <p className="text-xs text-neutral-500">Uploaded on creation</p>
                          </div>
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-black border border-neutral-800 rounded-sm">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-neutral-400" />
                          <div>
                            <p className="text-white">Smart Contract</p>
                            <p className="text-xs text-neutral-500">Deployed on-chain</p>
                          </div>
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                    </div>
                    
                    <p className="text-xs text-neutral-500 mt-4 text-center">
                      Additional documents will be available after compliance review
                    </p>
                  </div>
                </div>
              )}
              
              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-6">
                  {loadingTransactions ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 text-neutral-500 animate-spin" />
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((tx, index) => (
                        <div key={index} className="bg-neutral-950 border border-neutral-900 p-4">
                          {/* Transaction details here */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-neutral-500 mb-2">No transactions recorded yet</p>
                      <p className="text-neutral-600 text-sm">Be the first to invest in this asset</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Ownership Distribution Card */}
              <div className="bg-neutral-950 border border-neutral-900 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Ownership Distribution</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Sold</span>
                    <span className="text-sm font-semibold text-white">{soldPercentage.toFixed(2)}%</span>
                  </div>
                  
                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${availablePercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Available</span>
                    <span className="text-sm font-semibold text-green-400">{availablePercentage.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              
              {/* Purchase Card */}
              <div className="bg-neutral-950 border border-neutral-900 p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Price per Share</p>
                    <p className="text-2xl font-semibold text-white">{property.pricePerShare} OPN</p>
                  </div>
                  
                  {property.requiresPurchaserKYC && (
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
      </div>
      
      {/* Buy Modal */}
      {showBuyModal && (
        <PropertyModal 
          property={property}
          onClose={() => setShowBuyModal(false)}
        />
      )}
    </div>
  );
};

export default PropertyDetailView;