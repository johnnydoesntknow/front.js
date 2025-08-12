// src/components/create/CreateView.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useContract } from '../../hooks/useContract';
import { useApp } from '../../contexts/AppContext';
import { Loader2, Upload, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';
import KYCSubmission from '../kyc/KYCSubmission';

const CreateView = () => {
  const { isConnected, address } = useWeb3();
  const { fractionalization, kyc } = useContract();
  const { showNotification, userKYCStatus } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [checkingKYC, setCheckingKYC] = useState(true);
  const [kycSubmitted, setKycSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    assetType: 'Luxury Watch',
    assetName: '',
    assetDescription: '',
    assetImageUrl: '',
    totalFractions: 100,
    pricePerFraction: '0.1',
    requiresPurchaserKYC: true
  });

  // Check if KYC was already submitted
  useEffect(() => {
    if (address) {
      const submitted = localStorage.getItem(`kyc_submitted_${address}`);
      setKycSubmitted(submitted === 'true');
    }
  }, [address]);

  // Check KYC status
  useEffect(() => {
    const checkKYC = async () => {
      if (!kyc || !address || !isConnected) {
        setCheckingKYC(false);
        return;
      }

      try {
        setCheckingKYC(true);
        const verified = await kyc.isVerified(address);
        // If verified, clear the submitted flag
        if (verified && kycSubmitted) {
          localStorage.removeItem(`kyc_submitted_${address}`);
          setKycSubmitted(false);
        }
      } catch (error) {
        console.error('Error checking KYC:', error);
      } finally {
        setCheckingKYC(false);
      }
    };
    
    checkKYC();
  }, [kyc, address, isConnected, kycSubmitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fractionalization) {
      showNotification('Please connect your wallet', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const tx = await fractionalization.createFractionalizationRequest(
        formData.assetType,
        formData.assetName,
        formData.assetDescription,
        formData.assetImageUrl,
        formData.totalFractions,
        ethers.utils.parseEther(formData.pricePerFraction),
        formData.requiresPurchaserKYC
      );

      const receipt = await tx.wait();
      
      // Extract request ID from event logs
      const event = receipt.logs.find(log => {
        try {
          const parsed = fractionalization.interface.parseLog(log);
          return parsed.name === 'RequestCreated';
        } catch {
          return false;
        }
      });

      const requestId = event ? fractionalization.interface.parseLog(event).args.requestId : 'Unknown';
      
      showNotification(
        `Request #${requestId} created successfully! It will be reviewed by our compliance team.`, 
        'success'
      );
      
      // Reset form
      setFormData({
        assetType: 'Luxury Watch',
        assetName: '',
        assetDescription: '',
        assetImageUrl: '',
        totalFractions: 100,
        pricePerFraction: '0.1',
        requiresPurchaserKYC: true
      });
    } catch (error) {
      console.error('Error creating request:', error);
      
      let errorMessage = 'Failed to create request. Please try again.';
      
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        if (error.message.includes('Proposer must be KYC verified')) {
          errorMessage = 'KYC verification is required. Please complete the verification process.';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient OPN balance for transaction fees.';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was cancelled.';
        }
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="heading-2 text-white mb-4">Connect Your Wallet</h2>
          <p className="body-text">Connect your wallet to create fractionalization requests</p>
        </div>
      </div>
    );
  }

  if (checkingKYC) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  // Show KYC submission form if not verified
  if (!userKYCStatus && !kycSubmitted) {
    return (
      <div className="min-h-screen bg-black py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="heading-1 text-white mb-4">Create Request</h1>
            <p className="body-text">Complete KYC verification to create fractionalization requests</p>
          </div>
          <KYCSubmission onComplete={() => setKycSubmitted(true)} />
        </div>
      </div>
    );
  }

  // Show pending KYC status
  if (!userKYCStatus && kycSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
          <h2 className="heading-2 text-white mb-4">KYC Verification Pending</h2>
          <p className="body-text mb-6">
            Your KYC application is being reviewed by our compliance team. 
            This typically takes 24-48 hours.
          </p>
          <p className="text-sm text-neutral-500">
            You'll be notified once your verification is complete.
          </p>
          <div className="mt-8">
            <p className="text-xs text-neutral-600">
              Application submitted for: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show the create form if KYC verified
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="heading-1 text-white mb-4">Create Request</h1>
          <p className="body-text">
            Submit your asset for fractionalization. Our compliance team will review your request.
          </p>
        </div>

        {/* Success Banner - KYC Verified */}
        <div className="mb-8 p-4 bg-green-900/20 border border-green-900/50 rounded-sm">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-green-200">
              <p className="font-medium mb-1">KYC Verified</p>
              <p className="text-green-200/80">
                You're verified and can create fractionalization requests.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Asset Information */}
          <section>
            <h3 className="text-lg font-normal text-white mb-6">Asset Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label-text block mb-3">Asset Type</label>
                <select
                  value={formData.assetType}
                  onChange={(e) => setFormData({...formData, assetType: e.target.value})}
                  className="input-field"
                  disabled={loading}
                >
                  <option>Real Estate</option>
                  <option>Luxury Watch</option>
                  <option>Digital Art</option>
                  <option>Classic Car Model</option>
                  <option>NFT Collection</option>
                  <option>Other Collectible</option>
                </select>
              </div>

              <div>
                <label className="label-text block mb-3">Asset Name</label>
                <input
                  type="text"
                  value={formData.assetName}
                  onChange={(e) => setFormData({...formData, assetName: e.target.value})}
                  className="input-field"
                  placeholder="e.g., Patek Philippe Nautilus"
                  required
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label-text block mb-3">Description</label>
                <textarea
                  value={formData.assetDescription}
                  onChange={(e) => setFormData({...formData, assetDescription: e.target.value})}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Provide detailed information about your asset, including condition, provenance, and any unique features"
                  required
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label-text block mb-3">Image URL</label>
                <input
                  type="url"
                  value={formData.assetImageUrl}
                  onChange={(e) => setFormData({...formData, assetImageUrl: e.target.value})}
                  className="input-field"
                  placeholder="https://..."
                  required
                  disabled={loading}
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Provide a high-quality image URL of your asset
                </p>
              </div>
            </div>
          </section>

          {/* Fractionalization Details */}
          <section>
            <h3 className="text-lg font-normal text-white mb-6">Fractionalization Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label-text block mb-3">Total Fractions</label>
                <input
                  type="number"
                  value={formData.totalFractions}
                  onChange={(e) => setFormData({...formData, totalFractions: parseInt(e.target.value) || 1})}
                  min="1"
                  max="10000"
                  className="input-field"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Number of fractions to create (1-10,000)
                </p>
              </div>

              <div>
                <label className="label-text block mb-3">Price per Fraction (OPN)</label>
                <input
                  type="number"
                  value={formData.pricePerFraction}
                  onChange={(e) => setFormData({...formData, pricePerFraction: e.target.value})}
                  min="0.001"
                  step="0.001"
                  className="input-field"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Set the price for each fraction in OPN tokens
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.requiresPurchaserKYC}
                    onChange={(e) => setFormData({...formData, requiresPurchaserKYC: e.target.checked})}
                    className="w-4 h-4 text-white bg-black border-neutral-800 
                             rounded focus:ring-white focus:ring-offset-black"
                    disabled={loading}
                  />
                  <span className="text-white">Require KYC for purchasers</span>
                </label>
                <p className="text-sm text-neutral-500 mt-2 ml-7">
                  Enable this to restrict purchases to KYC-verified users only. 
                  Recommended for high-value assets.
                </p>
              </div>
            </div>

            {/* Total Value Display */}
            <div className="mt-6 p-4 bg-neutral-950 rounded-sm">
              <p className="text-sm text-neutral-400 mb-2">Total Asset Value</p>
              <p className="text-2xl font-light text-white">
                {(formData.totalFractions * parseFloat(formData.pricePerFraction || 0)).toFixed(2)} OPN
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Platform fee: 2.5% on each transaction
              </p>
            </div>
          </section>

          {/* Asset Approval Notice */}
          <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-sm">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-neutral-300">
                <p className="font-medium mb-1">Asset Verification Required</p>
                <p className="text-neutral-400">
                  After submission, our compliance team will verify the authenticity and ownership 
                  of your asset before approving it for fractionalization. This process typically 
                  takes 2-3 business days.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <section className="border-t border-neutral-900 pt-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                <p>Connected as: {address.slice(0, 6)}...{address.slice(-4)}</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Request...</span>
                  </>
                ) : (
                  <span>Submit Request</span>
                )}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
};

export default CreateView;