import { ethers } from 'ethers';

// Updated Contract ABIs matching your deployed contracts
export const FRACTIONALIZATION_ABI = [
  // Constructor
  "constructor(address _kycRegistry, address _feeRecipient, bool _isAlphaMode)",
  
  // Role constants - UPDATED
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function COMPLIANCE_ROLE() view returns (bytes32)",
  "function ADMIN_ROLE() view returns (bytes32)",
  "function EMERGENCY_ROLE() view returns (bytes32)",
  
  // AccessControl functions
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function grantRole(bytes32 role, address account)",
  "function revokeRole(bytes32 role, address account)",
  
  // Platform settings - NEW
  "function platformFee() view returns (uint256)",
  "function feeRecipient() view returns (address)",
  "function isAlphaMode() view returns (bool)",
  "function emergencyMode() view returns (bool)",
  "function kycRegistry() view returns (address)",
  
  // Request Management - UPDATED
  "function createFractionalizationRequest(string _assetType, string _assetName, string _assetDescription, string _assetImageUrl, uint256 _totalShares, uint256 _pricePerShare, uint256 _minPurchaseAmount, uint256 _maxPurchaseAmount, uint8 _shareType, bool _requiresPurchaserKYC)",
  "function approveRequest(uint256 _requestId)",
  "function rejectRequest(uint256 _requestId, string _reason)",
  "function cancelRequest(uint256 _requestId)",
  
  // Purchase functions - UPDATED
  "function purchaseShares(uint256 _assetId, uint256 _shareAmount, uint256 _maxPricePerShare) payable",
  
  // Transfer functions - NEW
  "function transferShares(address _to, uint256 _assetId, uint256 _amount)",
  "function lockShares(uint256 _assetId, uint256 _amount, uint256 _lockDuration)",
  "function unlockShares(uint256 _assetId)",
  
  // View functions - UPDATED
  "function requests(uint256) view returns (uint256 requestId, address proposer, string assetType, string assetName, string assetDescription, string assetImageUrl, uint256 totalShares, uint256 pricePerShare, uint256 minPurchaseAmount, uint256 maxPurchaseAmount, uint8 shareType, bool requiresPurchaserKYC, uint8 status, uint256 assetId, uint256 timestamp)",
  "function assetDetails(uint256) view returns (uint256 assetId, uint256 requestId, address creator, uint256 totalShares, uint256 availableShares, uint256 pricePerShare, uint256 minPurchaseAmount, uint256 maxPurchaseAmount, uint8 shareType, bool requiresPurchaserKYC, bool isActive, uint256 totalRevenue, uint256 totalInvestors, uint256 createdAt, uint256 lastActivityAt)",
  "function userShares(uint256 assetId, address user) view returns (uint256)",
  "function getUserShares(address _user, uint256 _assetId) view returns (uint256)",
  "function getAvailableShares(address _user, uint256 _assetId) view returns (uint256)",
  "function getUserOwnershipPercentage(address _user, uint256 _assetId) view returns (uint256 percentage, uint256 shares)",
  "function getAssetInvestors(uint256 _assetId) view returns (address[])",
  "function getUserAssets(address _user) view returns (uint256[])",
  "function calculatePurchaseCost(uint256 _assetId, uint256 _shareAmount) view returns (uint256 totalCost, uint256 platformFeeAmount, uint256 creatorAmount)",
  "function getPendingRequests(uint256 _offset, uint256 _limit) view returns (uint256[] requestIds, uint256 total)",
  "function getActiveAssets(uint256 _offset, uint256 _limit) view returns (uint256[] assetIds, uint256 total)",
  
  // Admin functions - UPDATED
  "function toggleAlphaMode(bool _isEnabled)",
  "function toggleEmergencyMode()",
  "function updatePlatformFee(uint256 _newFee)",
  "function updateFeeRecipient(address _newRecipient)",
  "function deactivateAsset(uint256 _assetId)",
  "function pause()",
  "function unpause()",
  
  // Emergency functions - NEW
  "function emergencyWithdraw(uint256 _assetId)",
  
  // Events - UPDATED
  "event RequestCreated(uint256 indexed requestId, address indexed proposer, string assetName, uint256 totalShares, uint256 pricePerShare, uint8 shareType)",
  "event RequestApproved(uint256 indexed requestId, uint256 indexed assetId, address indexed approver)",
  "event RequestAutoApproved(uint256 indexed requestId, uint256 indexed assetId, address indexed proposer)",
  "event RequestRejected(uint256 indexed requestId, address indexed rejector, string reason)",
  "event RequestCancelled(uint256 indexed requestId, address indexed proposer)",
  "event SharesPurchased(uint256 indexed assetId, address indexed buyer, uint256 sharesAmount, uint256 totalCost)",
  "event SharesTransferred(uint256 indexed assetId, address indexed from, address indexed to, uint256 amount)",
  "event SharesLocked(uint256 indexed assetId, address indexed owner, uint256 amount, uint256 until)",
  "event SharesUnlocked(uint256 indexed assetId, address indexed owner, uint256 amount)",
  "event AssetDeactivated(uint256 indexed assetId)",
  "event PlatformFeeUpdated(uint256 newFee)",
  "event AlphaModeToggled(bool isEnabled)",
  "event EmergencyModeToggled(bool isEnabled)",
  "event EmergencyWithdrawal(uint256 indexed assetId, address indexed user, uint256 shares, uint256 refundAmount)"
];

// KYC Registry ABI - UPDATED
export const KYC_ABI = [
  "constructor(bool _isTestnet)",
  
  // Role constants
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function KYC_VERIFIER_ROLE() view returns (bytes32)",
  "function ADMIN_ROLE() view returns (bytes32)",
  
  // KYC functions
  "function isVerified(address user) view returns (bool)",
  "function getUserKYCData(address user) view returns (bool verified, uint256 verificationDate, uint256 expiryDate, string documentHash, address verifiedBy, bool isBlacklisted)",
  "function verifyKYC(address user, string documentHash, uint256 validityPeriod)",
  "function revokeKYC(address user, string reason)",
  "function DEFAULT_VALIDITY_PERIOD() view returns (uint256)",
  "function blacklist(address) view returns (bool)",
  
  // Testnet functions
  "function isTestnet() view returns (bool)",
  "function completeMockKYC()",
  
  // Events
  "event KYCVerified(address indexed user, address indexed verifier, uint256 expiryDate, string documentHash)",
  "event KYCRevoked(address indexed user, address indexed revoker, string reason)",
  "event MockKYCCompleted(address indexed user, uint256 timestamp)"
];

// YOUR DEPLOYED CONTRACT ADDRESSES
export const CONTRACTS = {
  // OPN Network - Updated with your deployed contracts
  opn: {
    fractionalization: '0x2192c02EA94EBCf11d71aFe9E4e40A06821C4b28',
    kyc: '0xd11A9532a8d8c7E48036F4B8f2d48a8138fD989c',
  },
  // Keep other networks for future expansion
  mainnet: {
    fractionalization: '0x0000000000000000000000000000000000000000',
    kyc: '0x0000000000000000000000000000000000000000',
  },
  polygon: {
    fractionalization: '0x0000000000000000000000000000000000000000',
    kyc: '0x0000000000000000000000000000000000000000',
  },
  arbitrum: {
    fractionalization: '0x0000000000000000000000000000000000000000',
    kyc: '0x0000000000000000000000000000000000000000',
  },
};

// Helper functions remain the same
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

export const estimateGas = async (contract, method, args, value = '0') => {
  try {
    const gasEstimate = await contract.estimateGas[method](...args, { value });
    return gasEstimate.mul(110).div(100); // Add 10% buffer
  } catch (error) {
    console.error('Gas estimation failed:', error);
    throw error;
  }
};

export const formatBalance = (balance, decimals = 18) => {
  return ethers.utils.formatUnits(balance, decimals);
};

export const parseAmount = (amount, decimals = 18) => {
  return ethers.utils.parseUnits(amount.toString(), decimals);
};

// Constants for the new contract
export const PRICE_PRECISION = ethers.utils.parseEther('1'); // 1e18
export const BASIS_POINTS = 10000;
export const MAX_PLATFORM_FEE = 1000; // 10%

// Share types enum
export const ShareType = {
  WeightedShares: 0,
  EqualShares: 1
};

// Request status enum
export const RequestStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
  Cancelled: 3
};
