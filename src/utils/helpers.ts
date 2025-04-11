import { ethers } from 'ethers';
import { NETWORK_CONFIG } from './config';

/**
 * Format an address for display
 * @param address Ethereum address
 * @param length Number of characters to show at start and end
 * @returns Formatted address string
 */
export const formatAddress = (address: string, length: number = 4): string => {
  if (!address) return 'None';
  if (address === ethers.ZeroAddress) return 'None';
  if (address.length < length * 2 + 3) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

/**
 * Format ETH value for display
 * @param value Wei value as bigint
 * @param decimals Number of decimals to show
 * @returns Formatted ETH string
 */
export const formatEth = (value: bigint | null, decimals: number = 4): string => {
  if (value === null) return '0';
  return ethers.formatEther(value).slice(0, decimals + 2);
};

/**
 * Get network name from chain ID
 * @param chainId Ethereum chain ID
 * @returns Network name
 */
export const getNetworkName = (chainId: number): string => {
  return NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG]?.name || 'Unknown Network';
};

/**
 * Get block explorer URL for an address
 * @param chainId Ethereum chain ID
 * @param address Ethereum address
 * @returns Block explorer URL
 */
export const getExplorerUrl = (chainId: number, address: string): string => {
  const explorer = NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG]?.blockExplorer;
  if (!explorer) return '';
  return `${explorer}/address/${address}`;
};

/**
 * Get transaction explorer URL
 * @param chainId Ethereum chain ID
 * @param txHash Transaction hash
 * @returns Transaction explorer URL
 */
export const getTxExplorerUrl = (chainId: number, txHash: string): string => {
  const explorer = NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG]?.blockExplorer;
  if (!explorer) return '';
  return `${explorer}/tx/${txHash}`;
};

/**
 * Validate hex color format
 * @param color Color string
 * @returns True if valid hex color
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

/**
 * Generate a random hex color
 * @returns Random hex color string
 */
export const randomHexColor = (): string => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
};

/**
 * Sleep for a specified time
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Convert pixel ID to coordinates
 * @param pixelId Pixel ID
 * @param gridSize Grid size
 * @returns Coordinates object
 */
export const pixelIdToCoordinates = (pixelId: number, gridSize: number): { x: number, y: number } => {
  const y = Math.floor(pixelId / gridSize);
  const x = pixelId % gridSize;
  return { x, y };
};

/**
 * Convert coordinates to pixel ID
 * @param x X coordinate
 * @param y Y coordinate
 * @param gridSize Grid size
 * @returns Pixel ID
 */
export const coordinatesToPixelId = (x: number, y: number, gridSize: number): number => {
  return y * gridSize + x;
};
