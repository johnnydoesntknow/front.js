// ============================================
// UPDATE: src/components/create/CreateView.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useCreateAsset } from '../../hooks/useCreateAsset';
import { useApp } from '../../contexts/AppContext';
import { useContract } from '../../hooks/useContract';
import { 
  Upload, 
  AlertCircle, 
  Loader2, 
  CheckCircle,
  Shield,
  FileText,
  Users,
  ChevronRight,
  ChevronLeft,
  Info,
  TrendingUp,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { ethers } from 'ethers';

const CreateView = () => {
  const { address, isConnected } = useWeb3();
  const { createAsset, checkAlphaMode, loading: createLoading } = useCreateAsset();
  const { showNotification } = useApp();
  const { kyc } = useContract();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isAlphaMode, setIsAlphaMode] = useState(false);
  const [kycVerified, setKycVerified] = useState(true); // Always true in testnet
  
  const [formData, setFormData] = useState({
    // Asset Information
    assetType: 'Real Estate',
    assetName: '',
    assetDescription: '',
    assetImageUrl: '',
    
    // Fractionalization Details - UPDATED
    totalShares: 1000,
    pricePerShare: '',
    minPurchaseAmount: 1,
    maxPurchaseAmount: 0, // 0 = unlimited
    shareType: 'weighted', // 'weighted' or 'equal'
    requiresPurchaserKYC: false,
    
    // Legal Confirmations
    ownershipConfirmed: false,
    termsAccepted: false
  });

  const [errors, setErrors] = useState({});

  // Check alpha mode on mount
  useEffect(() => {
    const checkMode = async () => {
      const mode = await checkAlphaMode();
      setIsAlphaMode(mode);
    };
    checkMode();
  }, []);

  // Check KYC status (auto-verified in testnet)
  useEffect(() => {
  // AUTO-VERIFY EVERYONE - Skip all contract calls
  if (address) {
    setKycVerified(true); // Everyone is automatically verified
  }
}, [address]);

  const steps = [
    { number: 1, title: 'Asset Details', icon: FileText },
    { number: 2, title: 'Share Structure', icon: Users },
    { number: 3, title: 'Review & Submit', icon: CheckCircle }
  ];

  // Validation for each step
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.assetName.trim()) {
          newErrors.assetName = 'Asset name is required';
        } else if (formData.assetName.length > 128) {
          newErrors.assetName = 'Asset name must be less than 128 characters';
        }
        
        if (!formData.assetDescription.trim()) {
          newErrors.assetDescription = 'Description is required';
        }
        
        if (!formData.assetImageUrl.trim()) {
          newErrors.assetImageUrl = 'Image URL is required';
        }
        break;
      
      case 2:
        if (formData.totalShares < 1) {
          newErrors.totalShares = 'Must have at least 1 share';
        }
        if (formData.totalShares > 1000000000) {
          newErrors.totalShares = 'Maximum 1 billion shares allowed';
        }
        
        if (!formData.pricePerShare || parseFloat(formData.pricePerShare) <= 0) {
          newErrors.pricePerShare = 'Price must be greater than 0';
        }
        if (parseFloat(formData.pricePerShare) > 1000000) {
          newErrors.pricePerShare = 'Price seems too high (max 1M OPN per share)';
        }
        
        if (formData.minPurchaseAmount < 1) {
          newErrors.minPurchaseAmount = 'Minimum purchase must be at least 1';
        }
        if (formData.minPurchaseAmount > formData.totalShares) {
          newErrors.minPurchaseAmount = 'Cannot exceed total shares';
        }
        
        if (formData.maxPurchaseAmount !== 0 && formData.maxPurchaseAmount < formData.minPurchaseAmount) {
          newErrors.maxPurchaseAmount = 'Must be greater than minimum purchase';
        }
        break;

      case 3:
        if (!formData.ownershipConfirmed) {
          newErrors.ownershipConfirmed = 'You must confirm ownership';
        }
        if (!formData.termsAccepted) {
          newErrors.termsAccepted = 'You must accept the terms';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [field]: undefined
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);
      
      const { tx, requestId } = await createAsset(formData);
      
      if (isAlphaMode) {
        showNotification(
          `Asset created and auto-approved! Request ID: ${requestId}`,
          'success'
        );
      } else {
        showNotification(
          `Asset request submitted! Request ID: ${requestId}. Waiting for compliance approval.`,
          'success'
        );
      }
      
      // Reset form
      setFormData({
        assetType: 'Real Estate',
        assetName: '',
        assetDescription: '',
        assetImageUrl: '',
        totalShares: 1000,
        pricePerShare: '',
        minPurchaseAmount: 1,
        maxPurchaseAmount: 0,
        shareType: 'weighted',
        requiresPurchaserKYC: false,
        ownershipConfirmed: false,
        termsAccepted: false
      });
      setCurrentStep(1);
      
    } catch (error) {
      console.error('Submit error:', error);
      showNotification(error.message || 'Failed to create asset', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total value
  const totalValue = formData.pricePerShare && formData.totalShares
    ? (parseFloat(formData.pricePerShare) * parseInt(formData.totalShares)).toFixed(2)
    : '0.00';

  // Render step 1: Asset Details
  const renderAssetDetailsStep = () => (
    <div className="space-y-6">
      <div className="bg-neutral-900 p-6 border border-neutral-800">
        <h3 className="text-xl font-normal text-white mb-4">Asset Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Asset Type</label>
            <select 
              value={formData.assetType}
              onChange={(e) => handleInputChange('assetType', e.target.value)}
              className="w-full bg-black border border-neutral-800 px-4 py-3 text-white"
            >
              <option value="Real Estate">Real Estate</option>
              <option value="Art">Art</option>
              <option value="Collectibles">Collectibles</option>
              <option value="Commodities">Commodities</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Asset Name *</label>
            <input
              type="text"
              value={formData.assetName}
              onChange={(e) => handleInputChange('assetName', e.target.value)}
              placeholder="e.g., Dubai Marina Penthouse"
              maxLength={128}
              className={`w-full bg-black border px-4 py-3 text-white ${
                errors.assetName ? 'border-red-500' : 'border-neutral-800'
              }`}
            />
            {errors.assetName && (
              <p className="text-red-400 text-xs mt-1">{errors.assetName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Description *</label>
            <textarea
              value={formData.assetDescription}
              onChange={(e) => handleInputChange('assetDescription', e.target.value)}
              placeholder="Detailed description of your asset..."
              rows={4}
              className={`w-full bg-black border px-4 py-3 text-white ${
                errors.assetDescription ? 'border-red-500' : 'border-neutral-800'
              }`}
            />
            {errors.assetDescription && (
              <p className="text-red-400 text-xs mt-1">{errors.assetDescription}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Image URL *</label>
            <input
              type="url"
              value={formData.assetImageUrl}
              onChange={(e) => handleInputChange('assetImageUrl', e.target.value)}
              placeholder="https://ipfs.io/ipfs/... or https://..."
              className={`w-full bg-black border px-4 py-3 text-white ${
                errors.assetImageUrl ? 'border-red-500' : 'border-neutral-800'
              }`}
            />
            {errors.assetImageUrl && (
              <p className="text-red-400 text-xs mt-1">{errors.assetImageUrl}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render step 2: Share Structure
  const renderShareStructureStep = () => (
    <div className="space-y-6">
      <div className="bg-neutral-900 p-6 border border-neutral-800">
        <h3 className="text-xl font-normal text-white mb-4">Share Structure</h3>
        
        {/* Share Type Selection */}
        <div className="mb-6">
          <label className="block text-sm text-neutral-400 mb-3">Share Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleInputChange('shareType', 'weighted')}
              className={`p-4 border ${
                formData.shareType === 'weighted' 
                  ? 'border-blue-500 bg-blue-500/10 text-white' 
                  : 'border-neutral-800 text-neutral-400'
              }`}
            >
              <TrendingUp className="w-5 h-5 mb-2" />
              <p className="font-medium">Weighted Shares</p>
              <p className="text-xs mt-1">Proportional ownership based on investment</p>
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('shareType', 'equal')}
              className={`p-4 border ${
                formData.shareType === 'equal' 
                  ? 'border-blue-500 bg-blue-500/10 text-white' 
                  : 'border-neutral-800 text-neutral-400'
              }`}
            >
              <Users className="w-5 h-5 mb-2" />
              <p className="font-medium">Equal Shares</p>
              <p className="text-xs mt-1">Fixed units with equal rights</p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Total Shares *</label>
            <input
              type="number"
              value={formData.totalShares}
              onChange={(e) => handleInputChange('totalShares', parseInt(e.target.value) || 0)}
              min="1"
              className={`w-full bg-black border px-4 py-3 text-white ${
                errors.totalShares ? 'border-red-500' : 'border-neutral-800'
              }`}
            />
            {errors.totalShares && (
              <p className="text-red-400 text-xs mt-1">{errors.totalShares}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Price per Share (OPN) *</label>
            <input
              type="number"
              value={formData.pricePerShare}
              onChange={(e) => handleInputChange('pricePerShare', e.target.value)}
              step="0.000001"
              min="0.000001"
              placeholder="0.1"
              className={`w-full bg-black border px-4 py-3 text-white ${
                errors.pricePerShare ? 'border-red-500' : 'border-neutral-800'
              }`}
            />
            {errors.pricePerShare && (
              <p className="text-red-400 text-xs mt-1">{errors.pricePerShare}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Min Purchase Amount *</label>
            <input
              type="number"
              value={formData.minPurchaseAmount}
              onChange={(e) => handleInputChange('minPurchaseAmount', parseInt(e.target.value) || 1)}
              min="1"
              className={`w-full bg-black border px-4 py-3 text-white ${
                errors.minPurchaseAmount ? 'border-red-500' : 'border-neutral-800'
              }`}
            />
            {errors.minPurchaseAmount && (
              <p className="text-red-400 text-xs mt-1">{errors.minPurchaseAmount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Max per User (0 = unlimited)</label>
            <input
              type="number"
              value={formData.maxPurchaseAmount}
              onChange={(e) => handleInputChange('maxPurchaseAmount', parseInt(e.target.value) || 0)}
              min="0"
              className={`w-full bg-black border px-4 py-3 text-white ${
                errors.maxPurchaseAmount ? 'border-red-500' : 'border-neutral-800'
              }`}
            />
            {errors.maxPurchaseAmount && (
              <p className="text-red-400 text-xs mt-1">{errors.maxPurchaseAmount}</p>
            )}
          </div>
        </div>

        {/* KYC Toggle */}
        <div className="mt-6 flex items-center justify-between p-4 bg-black border border-neutral-800">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-neutral-400" />
            <div>
              <p className="text-white">Require KYC for Purchasers</p>
              <p className="text-xs text-neutral-500">Restrict purchases to KYC-verified users only</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleInputChange('requiresPurchaserKYC', !formData.requiresPurchaserKYC)}
            className="text-white"
          >
            {formData.requiresPurchaserKYC ? (
              <ToggleRight className="w-8 h-8 text-blue-500" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-neutral-500" />
            )}
          </button>
        </div>

        {/* Total Value Display */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30">
          <div className="flex justify-between items-center">
            <p className="text-sm text-neutral-400">Total Asset Value:</p>
            <p className="text-2xl font-light text-white">{totalValue} OPN</p>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Platform fee: 2.5% on each purchase
          </p>
        </div>
      </div>
    </div>
  );

  // Render step 3: Review & Submit
  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Alpha Mode Notice */}
      {isAlphaMode && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <Info className="w-5 h-5" />
            <p className="text-sm font-medium">Alpha Mode Active</p>
          </div>
          <p className="text-xs text-yellow-400/80 mt-1">
            Your asset will be automatically approved after submission.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-neutral-900 p-6 border border-neutral-800">
        <h3 className="text-xl font-normal text-white mb-4">Review Your Asset</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-neutral-800">
            <span className="text-neutral-400">Asset Name</span>
            <span className="text-white">{formData.assetName || 'Not set'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-neutral-800">
            <span className="text-neutral-400">Type</span>
            <span className="text-white">{formData.assetType}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-neutral-800">
            <span className="text-neutral-400">Share Type</span>
            <span className="text-white capitalize">{formData.shareType} Shares</span>
          </div>
          <div className="flex justify-between py-2 border-b border-neutral-800">
            <span className="text-neutral-400">Total Shares</span>
            <span className="text-white">{formData.totalShares.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-neutral-800">
            <span className="text-neutral-400">Price per Share</span>
            <span className="text-white">{formData.pricePerShare} OPN</span>
          </div>
          <div className="flex justify-between py-2 border-b border-neutral-800">
            <span className="text-neutral-400">Total Value</span>
            <span className="text-white font-semibold">{totalValue} OPN</span>
          </div>
          <div className="flex justify-between py-2 border-b border-neutral-800">
            <span className="text-neutral-400">Min Purchase</span>
            <span className="text-white">{formData.minPurchaseAmount} shares</span>
          </div>
          <div className="flex justify-between py-2 border-b border-neutral-800">
            <span className="text-neutral-400">Max per User</span>
            <span className="text-white">
              {formData.maxPurchaseAmount === 0 ? 'Unlimited' : `${formData.maxPurchaseAmount} shares`}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-neutral-400">KYC Required</span>
            <span className="text-white">{formData.requiresPurchaserKYC ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* Legal Confirmations */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.ownershipConfirmed}
            onChange={(e) => handleInputChange('ownershipConfirmed', e.target.checked)}
            className="mt-0.5 w-5 h-5 bg-black border-2 border-neutral-700"
          />
          <div>
            <p className="text-sm text-white">I confirm asset ownership</p>
            <p className="text-xs text-neutral-500 mt-1">
              I legally own this asset and have the right to fractionalize it.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
            className="mt-0.5 w-5 h-5 bg-black border-2 border-neutral-700"
          />
          <div>
            <p className="text-sm text-white">I accept the platform terms</p>
            <p className="text-xs text-neutral-500 mt-1">
              I agree to the platform terms of service and the 2.5% transaction fee.
            </p>
          </div>
        </label>
      </div>

      {(errors.ownershipConfirmed || errors.termsAccepted) && (
        <div className="bg-red-900/10 border border-red-900/30 p-3">
          <p className="text-xs text-red-400">Please confirm all checkboxes to proceed</p>
        </div>
      )}
    </div>
  );

  // Main render
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
          <h2 className="text-xl font-light text-white mb-2">Wallet Not Connected</h2>
          <p className="text-neutral-400 font-light">Please connect your wallet to create fractionalized assets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white mb-2">Create Fractionalized Asset</h1>
          <p className="text-neutral-400">Transform your asset into tradeable digital shares on OPN Chain</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep >= step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-2
                      ${isActive ? 'bg-blue-500' : 'bg-neutral-800'}
                      ${isCompleted ? 'bg-green-500' : ''}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                      )}
                    </div>
                    <span className={`text-xs font-light ${isActive ? 'text-white' : 'text-neutral-500'}`}>
                      {step.title}
                    </span>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 transition-all duration-300 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-neutral-800'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && renderAssetDetailsStep()}
          {currentStep === 2 && renderShareStructureStep()}
          {currentStep === 3 && renderReviewStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 border flex items-center gap-2 transition-all ${
              currentStep === 1 
                ? 'border-neutral-800 text-neutral-600 cursor-not-allowed' 
                : 'border-neutral-700 text-white hover:bg-neutral-900'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-4">
            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || createLoading || !formData.ownershipConfirmed || !formData.termsAccepted}
                className={`px-8 py-3 flex items-center gap-2 transition-colors ${
                  loading || createLoading || !formData.ownershipConfirmed || !formData.termsAccepted
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {(loading || createLoading) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Create Asset
                  </>
                )}
              </button>
            )}
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateView;