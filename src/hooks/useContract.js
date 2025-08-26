// src/hooks/useContract.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { FRACTIONALIZATION_ABI, KYC_ABI, CONTRACTS } from '../utils/contracts';

export const useContract = () => {
  const { signer, chainId, isConnected } = useWeb3();
  const [contracts, setContracts] = useState({
    fractionalization: null,
    kyc: null
  });

  useEffect(() => {
    if (signer && isConnected && chainId) {
      const networkName = getNetworkName(chainId);
      const addresses = CONTRACTS[networkName] || CONTRACTS.opn;

      if (addresses) {
        const fractionalizationContract = new ethers.Contract(
          addresses.fractionalization,
          FRACTIONALIZATION_ABI,
          signer
        );

        const kycContract = new ethers.Contract(
          addresses.kyc,
          KYC_ABI,
          signer
        );

        setContracts({
          fractionalization: fractionalizationContract,
          kyc: kycContract
        });
      }
    } else {
      setContracts({
        fractionalization: null,
        kyc: null
      });
    }
  }, [signer, chainId, isConnected]);

  return contracts;
};

const getNetworkName = (chainId) => {
  switch (chainId) {
    case 1: return 'mainnet';
    case 137: return 'polygon';
    case 42161: return 'arbitrum';
    case 984: return 'opn';
    default: return 'opn'; // Default to OPN
  }
};