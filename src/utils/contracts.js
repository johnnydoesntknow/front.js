// src/utils/contracts.js
import { ethers } from 'ethers';

// Contract ABIs
export const FRACTIONALIZATION_ABI = [
  // AccessControl functions
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function getRoleAdmin(bytes32 role) view returns (bytes32)",
  "function grantRole(bytes32 role, address account)",
  "function revokeRole(bytes32 role, address account)",
  "function renounceRole(bytes32 role, address account)",
  
  // Role constants
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function COMPLIANCE_ROLE() view returns (bytes32)",
  "function ADMIN_ROLE() view returns (bytes32)",
  
  // Read functions
  "function getActiveAssets() view returns (uint256[])",
  "function assetDetails(uint256 tokenId) view returns (uint256 tokenId, uint256 requestId, address creator, uint256 totalSupply, uint256 availableSupply, uint256 pricePerFraction, bool requiresPurchaserKYC, bool isActive, uint256 totalRevenue)",
  "function requests(uint256 requestId) view returns (uint256 requestId, address proposer, string assetType, string assetName, string assetDescription, string assetImageUrl, uint256 totalFractions, uint256 pricePerFraction, bool requiresPurchaserKYC, uint8 status, uint256 tokenId, uint256 timestamp)",
  "function balanceOf(address owner, uint256 tokenId) view returns (uint256)",
  "function isKYCRequired(uint256 tokenId) view returns (bool)",
  "function getUserRequests(address user) view returns (uint256[])",
  "function getUserTokens(address user) view returns (uint256[])",
  "function getPendingRequests() view returns (uint256[])",
  "function getUserPurchases(address user, uint256 tokenId) view returns (uint256)",
  "function platformFee() view returns (uint256)",
  "function feeRecipient() view returns (address)",
  
  // Write functions
  "function createFractionalizationRequest(string assetType, string assetName, string assetDescription, string assetImageUrl, uint256 totalFractions, uint256 pricePerFraction, bool requiresPurchaserKYC)",
  "function approveRequest(uint256 requestId)",
  "function rejectRequest(uint256 requestId, string reason)",
  "function purchaseFractions(uint256 tokenId, uint256 amount) payable",
  "function withdrawRevenue(uint256 tokenId)",
  
  // Admin functions
  "function pause()",
  "function unpause()",
  "function updatePlatformFee(uint256 newFee)",
  "function updateFeeRecipient(address newRecipient)",
  "function setURI(string uri)",
  "function deactivateAsset(uint256 tokenId)",
  
  // Events
  "event RequestCreated(uint256 indexed requestId, address indexed proposer, string assetName, uint256 totalFractions, uint256 pricePerFraction)",
  "event RequestApproved(uint256 indexed requestId, uint256 indexed tokenId, address indexed approver)",
  "event RequestRejected(uint256 indexed requestId, address indexed rejector, string reason)",
  "event FractionsPurchased(uint256 indexed tokenId, address indexed buyer, uint256 amount, uint256 totalCost)",
  "event AssetDeactivated(uint256 indexed tokenId)",
  "event PlatformFeeUpdated(uint256 newFee)",
];

export const KYC_ABI = [
  // Role management
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function getRoleAdmin(bytes32 role) view returns (bytes32)",
  "function grantRole(bytes32 role, address account)",
  "function revokeRole(bytes32 role, address account)",
  "function renounceRole(bytes32 role, address account)",
  
  // Role constants
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function KYC_VERIFIER_ROLE() view returns (bytes32)",
  "function ADMIN_ROLE() view returns (bytes32)",
  
  // KYC functions
  "function isVerified(address user) view returns (bool)",
  "function getUserKYCData(address user) view returns (bool verified, uint256 verificationDate, uint256 expiryDate, string memory documentHash, address verifiedBy, bool isBlacklisted)",
  "function verifyKYC(address user, string documentHash, uint256 validityPeriod)",
  "function revokeKYC(address user, string reason)",
  "event KYCVerified(address indexed user, address indexed verifier, uint256 expiryDate, string documentHash)",
  "event KYCRevoked(address indexed user, address indexed revoker, string reason)",
];

// Contract addresses - OPN Network
export const CONTRACTS = {
  mainnet: {
    fractionalization: process.env.VITE_FRACTIONALIZATION_CONTRACT || '0x0000000000000000000000000000000000000000',
    kyc: process.env.VITE_KYC_REGISTRY_CONTRACT || '0x0000000000000000000000000000000000000000',
  },
  polygon: {
    fractionalization: '0x0000000000000000000000000000000000000000',
    kyc: '0x0000000000000000000000000000000000000000',
  },
  arbitrum: {
    fractionalization: '0x0000000000000000000000000000000000000000',
    kyc: '0x0000000000000000000000000000000000000000',
  },
  // OPN Network - Your deployed contracts
  opn: {
    fractionalization: process.env.VITE_FRACTIONALIZATION_CONTRACT || '0xE63c3D97e3cab05Ff717491A757Eb37b77Ee086d',
    kyc: process.env.VITE_KYC_REGISTRY_CONTRACT || '0x7d6de0Ab2b00875a6CEf64B4350c86A6F1e779CC',
  },
};

// Helper functions
export const getContractAddress = (contractName, chainId) => {
  const network = getNetworkName(chainId);
  return CONTRACTS[network]?.[contractName] || null;
};

export const getNetworkName = (chainId) => {
  switch (chainId) {
    case 1: return 'mainnet';
    case 137: return 'polygon';
    case 42161: return 'arbitrum';
    case 984: return 'opn';
    default: return 'opn';
  }
};

// Transaction helpers
export const estimateGas = async (contract, method, args, value = '0') => {
  try {
    const gasEstimate = await contract[method].estimateGas(...args, { value });
    // Add 10% buffer
    return gasEstimate * 110n / 100n;
  } catch (error) {
    console.error('Gas estimation failed:', error);
    throw error;
  }
};

// Format helpers for ethers v5
export const formatBalance = (balance, decimals = 18) => {
  return ethers.utils.formatEther(balance);
};

export const parseAmount = (amount, decimals = 18) => {
  return ethers.utils.parseEther(amount);
};