// src/components/create/CreateView.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useContract } from '../../hooks/useContract';
import { useApp } from '../../contexts/AppContext';
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
  TrendingUp
} from 'lucide-react';
import { ethers } from 'ethers';

const CreateView = () => {
  const { address, isConnected } = useWeb3();
  const { fractionalization, kycRegistry } = useContract();
  const { showNotification } = useApp();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [checkingKyc, setCheckingKyc] = useState(true);
  
  const [formData, setFormData] = useState({
    // Asset Information
    assetType: 'Real Estate',
    assetName: '',
    assetDescription: '',
    assetImageUrl: '',
    
    // Fractionalization Details
    totalFractions: 1000,
    pricePerFraction: '',
    requiresPurchaserKYC: false,
    
    // Documentation (for future enhancement)
    documentHash: '',
    
    // Legal Confirmations
    ownershipConfirmed: false,
    termsAccepted: false
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { number: 1, title: 'KYC Status', icon: Shield },
    { number: 2, title: 'Asset Details', icon: FileText },
    { number: 3, title: 'Tokenization', icon: Users },
    { number: 4, title: 'Review', icon: CheckCircle }
  ];

  // Check KYC status on mount
  useEffect(() => {
    const checkKycStatus = async () => {
      if (!kycRegistry || !address) {
        setCheckingKyc(false);
        return;
      }
      
      try {
        const verified = await kycRegistry.isVerified(address);
        setKycVerified(verified);
      } catch (error) {
        console.error('Error checking KYC status:', error);
      } finally {
        setCheckingKyc(false);
      }
    };
    
    checkKycStatus();
  }, [kycRegistry, address]);

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1:
        if (!kycVerified) {
          newErrors.kyc = 'KYC verification required';
        }
        break;
      case 2:
        if (!formData.assetName.trim()) newErrors.assetName = 'Asset name is required';
        if (!formData.assetDescription.trim()) newErrors.assetDescription = 'Description is required';
        if (!formData.assetImageUrl.trim()) newErrors.assetImageUrl = 'Image URL is required';
        break;
      case 3:
        if (!formData.pricePerFraction || parseFloat(formData.pricePerFraction) <= 0) {
          newErrors.pricePerFraction = 'Valid price is required';
        }
        if (formData.totalFractions < 100 || formData.totalFractions > 10000) {
          newErrors.totalFractions = 'Total fractions must be between 100 and 10,000';
        }
        break;
      case 4:
        if (!formData.ownershipConfirmed) newErrors.ownershipConfirmed = 'Ownership confirmation required';
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const calculateTotalValue = () => {
    const total = formData.totalFractions * parseFloat(formData.pricePerFraction || 0);
    return formatNumber(total.toFixed(2));
  };

  const calculatePlatformFee = () => {
    const total = formData.totalFractions * parseFloat(formData.pricePerFraction || 0);
    return formatNumber((total * 0.025).toFixed(2));
  };

  const calculateOwnerProceeds = () => {
    const total = formData.totalFractions * parseFloat(formData.pricePerFraction || 0);
    return formatNumber((total * 0.975).toFixed(2));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    if (!fractionalization) {
      showNotification('Please connect your wallet', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const tx = await fractionalization.createFractionalizationRequest(
        formData.assetType,
        formData.assetName,
        formData.assetDescription,
        formData.assetImageUrl,
        formData.totalFractions,
        ethers.utils.parseEther(formData.pricePerFraction),
        formData.requiresPurchaserKYC
      );

      await tx.wait();
      
      showNotification('Fractionalization request submitted successfully! Check your portfolio to track its status.', 'success');
      
      // Reset form to first step
      setCurrentStep(1);
      setFormData({
        assetType: 'Real Estate',
        assetName: '',
        assetDescription: '',
        assetImageUrl: '',
        totalFractions: 1000,
        pricePerFraction: '',
        requiresPurchaserKYC: false,
        documentHash: '',
        ownershipConfirmed: false,
        termsAccepted: false
      });
    } catch (error) {
      console.error('Submit error:', error);
      showNotification('Failed to submit request. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: KYC Verification
  const renderKYCStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className={`w-16 h-16 mx-auto mb-4 ${kycVerified ? 'text-green-500' : 'text-neutral-600'}`} />
        <h3 className="text-xl font-light text-white mb-2">Identity Verification</h3>
        <p className="text-neutral-400 font-light">
          Asset owners must complete KYC verification to ensure platform compliance
        </p>
      </div>

      {checkingKyc ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="ml-3 text-neutral-400">Checking verification status...</span>
        </div>
      ) : kycVerified ? (
        <div className="bg-green-900/10 border border-green-900/30 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-light text-green-400">Identity Verified</p>
              <p className="text-sm font-light text-neutral-400 mt-1">
                Your KYC verification is complete. You may proceed with asset tokenization.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-900/10 border border-amber-900/30 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-light text-amber-400">Verification Required</p>
              <p className="text-sm font-light text-neutral-400 mt-1">
                Please complete KYC verification before submitting assets for fractionalization.
              </p>
              <button className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-light hover:bg-blue-700 transition-colors">
                Start Verification Process
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-neutral-900 pt-6">
        <h4 className="text-sm font-light text-neutral-300 mb-4 uppercase tracking-wider">Process Overview</h4>
        <div className="space-y-3">
          {['Complete asset information', 'Configure tokenization parameters', 'Submit for compliance review', 'Asset listed on marketplace'].map((step, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-900 text-neutral-400 flex items-center justify-center text-xs font-light flex-shrink-0">
                {idx + 1}
              </div>
              <p className="text-sm font-light text-neutral-400">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 2: Asset Details
  const renderAssetDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-light text-white mb-2">Asset Information</h3>
        <p className="text-sm font-light text-neutral-400">Provide detailed information about your asset</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-xs font-light uppercase tracking-wider text-neutral-400 block mb-3">
            Asset Category
          </label>
          <select
            value={formData.assetType}
            onChange={(e) => setFormData({...formData, assetType: e.target.value})}
            className="w-full px-4 py-3 bg-black border border-neutral-900 text-white font-light focus:border-neutral-700 focus:outline-none transition-colors"
            disabled={loading}
          >
            <option>Real Estate</option>
            <option>Luxury Vehicle</option>
            <option>Fine Art</option>
            <option>Rare Collectible</option>
            <option>Digital Asset</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-light uppercase tracking-wider text-neutral-400 block mb-3">
            Asset Name
          </label>
          <input
            type="text"
            value={formData.assetName}
            onChange={(e) => setFormData({...formData, assetName: e.target.value})}
            className={`w-full px-4 py-3 bg-black border ${errors.assetName ? 'border-red-500' : 'border-neutral-900'} text-white font-light focus:border-neutral-700 focus:outline-none transition-colors`}
            placeholder="e.g., Downtown Dubai Penthouse"
            disabled={loading}
          />
          {errors.assetName && <p className="text-red-500 text-xs mt-2">{errors.assetName}</p>}
        </div>

        <div>
          <label className="text-xs font-light uppercase tracking-wider text-neutral-400 block mb-3">
            Description
          </label>
          <textarea
            value={formData.assetDescription}
            onChange={(e) => setFormData({...formData, assetDescription: e.target.value})}
            rows={4}
            className={`w-full px-4 py-3 bg-black border ${errors.assetDescription ? 'border-red-500' : 'border-neutral-900'} text-white font-light focus:border-neutral-700 focus:outline-none transition-colors resize-none`}
            placeholder="Provide comprehensive details about location, features, condition, and investment potential"
            disabled={loading}
          />
          {errors.assetDescription && <p className="text-red-500 text-xs mt-2">{errors.assetDescription}</p>}
        </div>

        <div>
          <label className="text-xs font-light uppercase tracking-wider text-neutral-400 block mb-3">
            Asset Image URL
          </label>
          <input
            type="url"
            value={formData.assetImageUrl}
            onChange={(e) => setFormData({...formData, assetImageUrl: e.target.value})}
            className={`w-full px-4 py-3 bg-black border ${errors.assetImageUrl ? 'border-red-500' : 'border-neutral-900'} text-white font-light focus:border-neutral-700 focus:outline-none transition-colors`}
            placeholder="https://..."
            disabled={loading}
          />
          {errors.assetImageUrl && <p className="text-red-500 text-xs mt-2">{errors.assetImageUrl}</p>}
          <p className="text-xs text-neutral-500 mt-2">High-resolution image showcasing your asset</p>
        </div>
      </div>
    </div>
  );

  // Step 3: Tokenization Configuration
  const renderTokenizationStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-light text-white mb-2">Tokenization Parameters</h3>
        <p className="text-sm font-light text-neutral-400">Configure fractional ownership structure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-light uppercase tracking-wider text-neutral-400 block mb-3">
            Total Fractions
          </label>
          <input
            type="number"
            value={formData.totalFractions}
            onChange={(e) => setFormData({...formData, totalFractions: parseInt(e.target.value) || 1})}
            min="100"
            max="10000"
            className={`w-full px-4 py-3 bg-black border ${errors.totalFractions ? 'border-red-500' : 'border-neutral-900'} text-white font-light focus:border-neutral-700 focus:outline-none transition-colors`}
            disabled={loading}
          />
          {errors.totalFractions && <p className="text-red-500 text-xs mt-2">{errors.totalFractions}</p>}
          <p className="text-xs text-neutral-500 mt-2">100 - 10,000 units</p>
        </div>

        <div>
          <label className="text-xs font-light uppercase tracking-wider text-neutral-400 block mb-3">
            Price per Fraction (OPN)
          </label>
          <input
            type="number"
            value={formData.pricePerFraction}
            onChange={(e) => setFormData({...formData, pricePerFraction: e.target.value})}
            step="0.01"
            min="0.01"
            className={`w-full px-4 py-3 bg-black border ${errors.pricePerFraction ? 'border-red-500' : 'border-neutral-900'} text-white font-light focus:border-neutral-700 focus:outline-none transition-colors`}
            placeholder="0.00"
            disabled={loading}
          />
          {errors.pricePerFraction && <p className="text-red-500 text-xs mt-2">{errors.pricePerFraction}</p>}
        </div>
      </div>

      <div className="bg-neutral-950 border border-neutral-900 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-light uppercase tracking-wider text-neutral-500">Total Valuation</span>
          <span className="text-2xl font-light text-white">{calculateTotalValue()} OPN</span>
        </div>
        
        <div className="h-px bg-neutral-900"></div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-light text-neutral-400">Platform Fee (2.5%)</span>
            <span className="text-sm font-light text-amber-400">{calculatePlatformFee()} OPN</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-light text-neutral-400">Your Proceeds</span>
            <span className="text-sm font-light text-green-400">{calculateOwnerProceeds()} OPN</span>
          </div>
        </div>
      </div>

      <div className="border border-neutral-900 p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.requiresPurchaserKYC}
            onChange={(e) => setFormData({...formData, requiresPurchaserKYC: e.target.checked})}
            className="mt-1"
            disabled={loading}
          />
          <div>
            <p className="text-sm font-light text-white">Require Purchaser Verification</p>
            <p className="text-xs font-light text-neutral-400 mt-1">
              Restrict purchases to KYC-verified investors only. Recommended for high-value assets.
            </p>
          </div>
        </label>
      </div>

      <div className="bg-blue-900/10 border border-blue-900/30 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs font-light text-neutral-300">
            <p className="mb-2">Each fraction represents {(100 / formData.totalFractions).toFixed(4)}% ownership</p>
            <p>Fractions are fully tradeable on secondary markets post-approval</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Review & Submit
  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-light text-white mb-2">Review Submission</h3>
        <p className="text-sm font-light text-neutral-400">Confirm details before submitting for compliance review</p>
      </div>

      <div className="bg-neutral-950 border border-neutral-900 p-6">
        <h4 className="text-xs font-light uppercase tracking-wider text-neutral-400 mb-4">Tokenization Summary</h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Asset</p>
              <p className="font-light text-white">{formData.assetName || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Category</p>
              <p className="font-light text-white">{formData.assetType}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Total Fractions</p>
              <p className="font-light text-white">{formatNumber(formData.totalFractions)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Price per Fraction</p>
              <p className="font-light text-white">{formData.pricePerFraction} OPN</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Total Value</p>
              <p className="font-light text-green-400">{calculateTotalValue()} OPN</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">KYC Required</p>
              <p className="font-light text-white">{formData.requiresPurchaserKYC ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={formData.ownershipConfirmed}
            onChange={(e) => setFormData({...formData, ownershipConfirmed: e.target.checked})}
            className="mt-1"
            disabled={loading}
          />
          <div>
            <p className="text-sm font-light text-white">I confirm legal ownership</p>
            <p className="text-xs font-light text-neutral-400 mt-1">
              I am the sole legal owner with full rights to tokenize this asset
            </p>
          </div>
        </label>
        {errors.ownershipConfirmed && <p className="text-red-500 text-xs ml-6">{errors.ownershipConfirmed}</p>}

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
            className="mt-1"
            disabled={loading}
          />
          <div>
            <p className="text-sm font-light text-white">Accept terms & conditions</p>
            <p className="text-xs font-light text-neutral-400 mt-1">
              I agree to the platform terms and fractionalization agreement
            </p>
          </div>
        </label>
        {errors.termsAccepted && <p className="text-red-500 text-xs ml-6">{errors.termsAccepted}</p>}
      </div>

      <div className="bg-amber-900/10 border border-amber-900/30 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs font-light text-neutral-300">
            <p className="font-normal text-amber-400 mb-2">Important Notice</p>
            <ul className="space-y-1 text-neutral-400">
              <li>• Compliance review typically takes 24-48 hours</li>
              <li>• Additional documentation may be requested</li>
              <li>• Approved assets are immediately listed on marketplace</li>
              <li>• Submissions cannot be modified once submitted</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch(currentStep) {
      case 1: return renderKYCStep();
      case 2: return renderAssetDetailsStep();
      case 3: return renderTokenizationStep();
      case 4: return renderReviewStep();
      default: return null;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400 font-light">Please connect your wallet to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
  <h1 className="text-4xl font-light text-white mb-2">Asset Tokenization</h1>
  <p className="text-neutral-400 font-light">
    Transform real-world assets into tradeable fractional ownership
  </p>
</div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-5 h-px bg-neutral-900" />
            <div 
              className="absolute left-0 top-5 h-px bg-blue-600 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="relative z-10 text-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive ? 'bg-blue-600 text-white' : 
                      isCompleted ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-900 text-neutral-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <p className={`text-xs font-light mt-2 ${
                    isActive ? 'text-white' : 'text-neutral-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-neutral-950 border border-neutral-900 p-8">
          {renderCurrentStep()}
          
          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-neutral-900">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-3 font-light transition-all flex items-center gap-2 ${
                currentStep === 1 
                  ? 'bg-neutral-900 text-neutral-600 cursor-not-allowed' 
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={currentStep === 1 && !kycVerified}
                className={`px-6 py-3 font-light transition-all flex items-center gap-2 ${
                  (currentStep === 1 && !kycVerified)
                    ? 'bg-neutral-900 text-neutral-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white font-light hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit for Review
                    <CheckCircle className="w-4 h-4" />
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