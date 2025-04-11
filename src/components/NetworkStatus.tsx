import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getNetworkName } from '../utils/helpers';
import BaseLogo from './BaseLogo';

interface NetworkStatusProps {
  provider: ethers.BrowserProvider | null;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ provider }) => {
  const [chainId, setChainId] = useState<number | null>(null);
  const [networkName, setNetworkName] = useState<string>('Not Connected');
  
  useEffect(() => {
    const getNetwork = async () => {
      if (!provider) {
        setChainId(null);
        setNetworkName('Not Connected');
        return;
      }
      
      try {
        const network = await provider.getNetwork();
        const chainIdValue = Number(network.chainId);
        setChainId(chainIdValue);
        setNetworkName(getNetworkName(chainIdValue));
      } catch (error) {
        console.error("Error getting network:", error);
        setChainId(null);
        setNetworkName('Error');
      }
    };
    
    getNetwork();
    
    // Listen for network changes
    if (window.ethereum) {
      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
        setNetworkName(getNetworkName(newChainId));
      };
      
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [provider]);
  
  // Check if we're on Base Chain
  const isBaseChain = chainId === 8453; // Base Mainnet
  const isBaseGoerli = chainId === 84531; // Base Goerli testnet
  const isOnBase = isBaseChain || isBaseGoerli;
  
  return (
    <div className={`network-status ${isOnBase ? 'on-base' : ''}`}>
      <div className="network-indicator">
        {isOnBase ? (
          <BaseLogo size={16} className="base-logo-small" />
        ) : (
          <span className={`status-dot ${provider ? 'connected' : 'disconnected'}`}></span>
        )}
        <span className="network-name">{networkName}</span>
      </div>
      
      {provider && !isOnBase && (
        <button 
          className="switch-network-button"
          onClick={async () => {
            if (!window.ethereum) return;
            
            try {
              // Request switch to Base Goerli Testnet
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x14A33' }], // 0x14A33 is 84531 in hex (Base Goerli Testnet)
              });
            } catch (switchError: any) {
              // This error code indicates that the chain has not been added to MetaMask
              if (switchError.code === 4902) {
                try {
                  await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                      {
                        chainId: '0x14A33', // 84531 in hex
                        chainName: 'Base Goerli Testnet',
                        nativeCurrency: {
                          name: 'ETH',
                          symbol: 'ETH',
                          decimals: 18,
                        },
                        rpcUrls: ['https://goerli.base.org'],
                        blockExplorerUrls: ['https://goerli.basescan.org'],
                      },
                    ],
                  });
                } catch (addError) {
                  console.error('Error adding Base Goerli Testnet:', addError);
                }
              }
            }
          }}
        >
          Switch to Base Testnet
        </button>
      )}
    </div>
  );
};

export default NetworkStatus;
