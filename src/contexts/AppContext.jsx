// src/contexts/AppContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useWeb3 } from './Web3Context';
import { useContract } from '../hooks/useContract';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { address, isConnected } = useWeb3();
  const { fractionalization, kyc } = useContract();
  
  const [assets, setAssets] = useState([]);
  const [userKYCStatus, setUserKYCStatus] = useState(false);
  const [isComplianceOfficer, setIsComplianceOfficer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Check user's KYC status
  useEffect(() => {
    const checkKYCStatus = async () => {
      if (!kyc || !address || !isConnected) {
        setUserKYCStatus(false);
        return;
      }

      try {
        const verified = await kyc.isVerified(address);
        setUserKYCStatus(verified);
      } catch (error) {
        console.error('Error checking KYC status:', error);
        setUserKYCStatus(false);
      }
    };

    checkKYCStatus();
  }, [kyc, address, isConnected]);

  // Check if user has compliance role
  useEffect(() => {
    const checkComplianceRole = async () => {
      console.log('AppContext - Checking compliance role:', {
        fractionalization: !!fractionalization,
        address,
        isConnected
      });
      
      if (!fractionalization || !address || !isConnected) {
        setIsComplianceOfficer(false);
        return;
      }

      try {
        const COMPLIANCE_ROLE = await fractionalization.COMPLIANCE_ROLE();
        console.log('COMPLIANCE_ROLE hash:', COMPLIANCE_ROLE);
        
        const hasRole = await fractionalization.hasRole(COMPLIANCE_ROLE, address);
        console.log('Has compliance role:', hasRole, 'for address:', address);
        
        setIsComplianceOfficer(hasRole);
      } catch (error) {
        console.error('Error checking compliance role:', error);
        setIsComplianceOfficer(false);
      }
    };

    checkComplianceRole();
  }, [fractionalization, address, isConnected]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <AppContext.Provider value={{
      assets,
      setAssets,
      userKYCStatus,
      setUserKYCStatus,
      isComplianceOfficer,
      setIsComplianceOfficer,
      loading,
      setLoading,
      notification,
      showNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};