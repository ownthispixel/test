/**
 * Application configuration
 */

// Contract address for the PixelOwnership contract
// This would typically be different for each network (mainnet, testnet, etc.)
export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with actual contract address when deployed

// Network configuration
export const NETWORK_CONFIG = {
  // Ethereum Mainnet
  1: {
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    blockExplorer: 'https://etherscan.io'
  },
  // Goerli Testnet
  5: {
    name: 'Goerli Testnet',
    currency: 'ETH',
    blockExplorer: 'https://goerli.etherscan.io'
  },
  // Sepolia Testnet
  11155111: {
    name: 'Sepolia Testnet',
    currency: 'ETH',
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  // Base Mainnet
  8453: {
    name: 'Base Mainnet',
    currency: 'ETH',
    blockExplorer: 'https://basescan.org',
    rpcUrl: 'https://mainnet.base.org'
  },
  // Base Goerli Testnet
  84531: {
    name: 'Base Goerli Testnet',
    currency: 'ETH',
    blockExplorer: 'https://goerli.basescan.org',
    rpcUrl: 'https://goerli.base.org'
  },
  // Polygon Mainnet
  137: {
    name: 'Polygon Mainnet',
    currency: 'MATIC',
    blockExplorer: 'https://polygonscan.com'
  },
  // Mumbai Testnet
  80001: {
    name: 'Mumbai Testnet',
    currency: 'MATIC',
    blockExplorer: 'https://mumbai.polygonscan.com'
  }
};

// Default network to use
export const DEFAULT_CHAIN_ID = 84531; // Base Goerli Testnet

// Canvas configuration
export const CANVAS_CONFIG = {
  gridSize: 1000,
  defaultVisibleGridSize: 20,
  defaultPixelColor: '#FFFFFF'
};

// API configuration
export const API_CONFIG = {
  metadataBaseUrl: 'https://api.ownthispixel.com/metadata'
};
