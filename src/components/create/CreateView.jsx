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
  const { fractionalization } = useContract();
  const { showNotification } = useApp();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  // Auto-approve KYC for everyone
  const kycVerified = true; // Always verified now!
  
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

  // Updated steps - removed KYC Status step
  const steps = [
    { number: 1, title: 'Asset Details', icon: FileText },
    { number: 2, title: 'Tokenization', icon: Users },
    { number: 3, title: 'Review', icon: CheckCircle }
  ];

  // Validation for each step
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.assetName.trim()) {
          newErrors.assetName = 'Asset name is required';
        }
        if (!formData.assetDescription.trim()) {
          newErrors.assetDescription = 'Description is required';
        }
        if (!formData.assetImageUrl.trim()) {
          newErrors.assetImageUrl = 'Image URL is required';
        }
        break;
      
      case 2:
        if (formData.totalFractions < 1) {
          newErrors.totalFractions = 'Must have at least 1 fraction';
        }
        if (formData.totalFractions > 1000000) {
          newErrors.totalFractions = 'Maximum 1,000,000 fractions allowed';
        }
        if (!formData.pricePerFraction || parseFloat(formData.pricePerFraction) <= 0) {
          newErrors.pricePerFraction = 'Price must be greater than 0';
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

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(3)) {
      showNotification('Please complete all required fields', 'error');
      return;
    }

    if (!fractionalization) {
      showNotification('Contract not connected', 'error');
      return;
    }

    try {
      setLoading(true);

      // Create the fractionalization request
      const tx = await fractionalization.createFractionalizationRequest(
        formData.assetType,
        formData.assetName,
        formData.assetDescription,
        formData.assetImageUrl,
        formData.totalFractions,
        ethers.utils.parseEther(formData.pricePerFraction.toString()),
        formData.requiresPurchaserKYC
      );

      showNotification('Creating fractionalization request...', 'info');
      
      const receipt = await tx.wait();
      
      // Since we're auto-approving, the request will be created and can be auto-approved
      showNotification('Fractionalization request created successfully!', 'success');

      // Reset form
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

      setCurrentStep(1);
      
    } catch (error) {
      console.error('Error creating request:', error);
      showNotification(error.message || 'Failed to create request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      showNotification('Please complete all required fields', 'error');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateTotalValue = () => {
    const fractions = parseInt(formData.totalFractions) || 0;
    const price = parseFloat(formData.pricePerFraction) || 0;
    return (fractions * price).toFixed(2);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Step 1: Asset Details
  const renderAssetDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-light text-white mb-2">Asset Information</h3>
        <p className="text-sm font-light text-neutral-400">Provide details about the asset you want to fractionalize</p>
      </div>

      <div>
        <label className="block text-sm font-light text-neutral-300 mb-2">
          Asset Type
        </label>
        <select
          value={formData.assetType}
          onChange={(e) => handleInputChange('assetType', e.target.value)}
          className="w-full px-4 py-3 bg-black border border-neutral-800 
                     text-white placeholder-neutral-500 
                     focus:border-blue-500 focus:outline-none transition-colors"
        >
          <option value="Real Estate">Real Estate</option>
          <option value="Vehicle">Luxury Vehicle</option>
          <option value="Art">Art & Collectibles</option>
          <option value="Commodity">Commodities</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-light text-neutral-300 mb-2">
          Asset Name *
        </label>
        <input
          type="text"
          value={formData.assetName}
          onChange={(e) => handleInputChange('assetName', e.target.value)}
          placeholder="e.g., Downtown Dubai Villa, Unit 1502"
          className={`w-full px-4 py-3 bg-black border 
                     ${errors.assetName ? 'border-red-500' : 'border-neutral-800'}
                     text-white placeholder-neutral-500 
                     focus:border-blue-500 focus:outline-none transition-colors`}
        />
        {errors.assetName && (
          <p className="mt-1 text-xs text-red-500">{errors.assetName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-light text-neutral-300 mb-2">
          Description *
        </label>
        <textarea
          value={formData.assetDescription}
          onChange={(e) => handleInputChange('assetDescription', e.target.value)}
          placeholder="Provide detailed information about the asset..."
          rows={4}
          className={`w-full px-4 py-3 bg-black border 
                     ${errors.assetDescription ? 'border-red-500' : 'border-neutral-800'}
                     text-white placeholder-neutral-500 
                     focus:border-blue-500 focus:outline-none transition-colors resize-none`}
        />
        {errors.assetDescription && (
          <p className="mt-1 text-xs text-red-500">{errors.assetDescription}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-light text-neutral-300 mb-2">
          Image URL *
        </label>
        <input
          type="url"
          value={formData.assetImageUrl}
          onChange={(e) => handleInputChange('assetImageUrl', e.target.value)}
          placeholder="https://example.com/asset-image.jpg"
          className={`w-full px-4 py-3 bg-black border 
                     ${errors.assetImageUrl ? 'border-red-500' : 'border-neutral-800'}
                     text-white placeholder-neutral-500 
                     focus:border-blue-500 focus:outline-none transition-colors`}
        />
        {errors.assetImageUrl && (
          <p className="mt-1 text-xs text-red-500">{errors.assetImageUrl}</p>
        )}
      </div>

      {formData.assetImageUrl && (
        <div className="mt-4">
          <p className="text-sm font-light text-neutral-400 mb-2">Preview:</p>
          <img 
            src={formData.assetImageUrl} 
            alt="Asset preview" 
            className="w-full h-48 object-cover border border-neutral-800"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800&q=80';
            }}
          />
        </div>
      )}
    </div>
  );

  // Step 2: Tokenization Details
  const renderTokenizationStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-light text-white mb-2">Fractionalization Settings</h3>
        <p className="text-sm font-light text-neutral-400">Configure how your asset will be tokenized</p>
      </div>

      <div>
        <label className="block text-sm font-light text-neutral-300 mb-2">
          Total Number of Fractions *
        </label>
        <input
          type="number"
          value={formData.totalFractions}
          onChange={(e) => handleInputChange('totalFractions', parseInt(e.target.value) || 0)}
          min="1"
          max="1000000"
          className={`w-full px-4 py-3 bg-black border 
                     ${errors.totalFractions ? 'border-red-500' : 'border-neutral-800'}
                     text-white placeholder-neutral-500 
                     focus:border-blue-500 focus:outline-none transition-colors`}
        />
        {errors.totalFractions && (
          <p className="mt-1 text-xs text-red-500">{errors.totalFractions}</p>
        )}
        <p className="mt-1 text-xs text-neutral-500">
          Recommended: 100-10,000 fractions depending on asset value
        </p>
      </div>

      <div>
        <label className="block text-sm font-light text-neutral-300 mb-2">
          Price per Fraction (OPN) *
        </label>
        <input
          type="number"
          value={formData.pricePerFraction}
          onChange={(e) => handleInputChange('pricePerFraction', e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
          className={`w-full px-4 py-3 bg-black border 
                     ${errors.pricePerFraction ? 'border-red-500' : 'border-neutral-800'}
                     text-white placeholder-neutral-500 
                     focus:border-blue-500 focus:outline-none transition-colors`}
        />
        {errors.pricePerFraction && (
          <p className="mt-1 text-xs text-red-500">{errors.pricePerFraction}</p>
        )}
      </div>

      {formData.pricePerFraction && formData.totalFractions && (
        <div className="bg-gradient-to-r from-blue-900/20 to-transparent border border-blue-900/30 p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-400">Total Asset Value:</span>
            <span className="text-xl font-light text-white">{calculateTotalValue()} OPN</span>
          </div>
        </div>
      )}

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

  // Step 3: Review & Submit
  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-light text-white mb-2">Review Submission</h3>
        <p className="text-sm font-light text-neutral-400">Confirm details before submitting</p>
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
              <p className="text-xs text-neutral-500 mb-1">Approval Status</p>
              <p className="font-light text-green-400">Approved</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.ownershipConfirmed}
            onChange={(e) => handleInputChange('ownershipConfirmed', e.target.checked)}
            className="mt-0.5 w-5 h-5 bg-black border-2 border-neutral-700 
                       checked:bg-blue-500 checked:border-blue-500 transition-colors"
          />
          <div>
            <p className="text-sm text-white">I confirm ownership</p>
            <p className="text-xs text-neutral-500 mt-1">
              I certify that I have full legal ownership or authority to fractionalize this asset.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
            className="mt-0.5 w-5 h-5 bg-black border-2 border-neutral-700 
                       checked:bg-blue-500 checked:border-blue-500 transition-colors"
          />
          <div>
            <p className="text-sm text-white">I accept the terms</p>
            <p className="text-xs text-neutral-500 mt-1">
              I agree to the platform terms of service and understand the 2.5% platform fee.
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
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)',
            animation: 'floatAnimation 6s ease-in-out infinite'
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
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-white mb-2">Create Fractionalized Asset</h1>
          <p className="text-neutral-400 font-light">
            Tokenize your real-world assets on the OPN blockchain
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-900/20 border border-blue-900/30 rounded-sm">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">Alpha Version - Platform in Early Testing</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-sm flex items-center justify-center border-2
                      transition-all duration-300
                      ${isActive ? 'bg-blue-500 border-blue-500' : ''}
                      ${isCompleted ? 'bg-green-500 border-green-500' : ''}
                      ${!isActive && !isCompleted ? 'bg-black border-neutral-700' : ''}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                      )}
                    </div>
                    <span className={`
                      mt-2 text-xs font-light
                      ${isActive ? 'text-white' : 'text-neutral-500'}
                    `}>
                      {step.title}
                    </span>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 transition-all duration-300
                      ${currentStep > step.number ? 'bg-green-500' : 'bg-neutral-800'}
                    `} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-neutral-950 border border-neutral-900 p-8 mb-8">
          {currentStep === 1 && renderAssetDetailsStep()}
          {currentStep === 2 && renderTokenizationStep()}
          {currentStep === 3 && renderReviewStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`
              px-6 py-3 border flex items-center gap-2 transition-all
              ${currentStep === 1 
                ? 'border-neutral-800 text-neutral-600 cursor-not-allowed' 
                : 'border-neutral-700 text-white hover:bg-neutral-900'}
            `}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-4">
            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-blue-500 text-white hover:bg-blue-600 
                         transition-colors flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.ownershipConfirmed || !formData.termsAccepted}
                className={`
                  px-8 py-3 flex items-center gap-2 transition-colors
                  ${loading || !formData.ownershipConfirmed || !formData.termsAccepted
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'}
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CreateView;