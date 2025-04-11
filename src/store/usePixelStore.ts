import { create } from 'zustand';
import { ethers } from 'ethers';
import { PixelOwnershipContract } from '../contracts/PixelOwnershipInterface';
import { CONTRACT_ADDRESS, CANVAS_CONFIG, DEFAULT_CHAIN_ID } from '../utils/config';

// Constants
const BLOCK_SIZE = 10; // Each pixel block is 10x10 pixels

// Define the pixel data type
export interface PixelData {
  id: number;
  x: number;
  y: number;
  owner: string;
  color: string;
}

// Define the store state
interface PixelState {
  // Wallet connection
  isConnected: boolean;
  account: string | null;
  provider: ethers.BrowserProvider | null;
  
  // Contract
  contract: PixelOwnershipContract | null;
  contractAddress: string;
  
  // Canvas state
  gridSize: number;
  pixelPrice: bigint | null;
  pixels: Map<number, PixelData>;
  selectedPixel: PixelData | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  initializeContract: () => Promise<void>;
  loadPixelData: (pixelId: number) => Promise<void>;
  loadPixelDataByCoordinates: (x: number, y: number) => Promise<void>;
  selectPixel: (pixelId: number | null) => void;
  claimSelectedPixel: () => Promise<void>;
  claimMultiplePixels: (pixelCoords: {x: number, y: number}[]) => Promise<void>;
  changePixelColor: (pixelId: number, color: string) => Promise<void>;
  setError: (error: string | null) => void;
}

// Create the store
export const usePixelStore = create<PixelState>((set, get) => ({
  // Initial state
  isConnected: false,
  account: null,
  provider: null,
  contract: null,
  contractAddress: CONTRACT_ADDRESS,
  gridSize: CANVAS_CONFIG.gridSize,
  pixelPrice: null,
  pixels: new Map(),
  selectedPixel: null,
  isLoading: false,
  error: null,
  
  // Connect wallet
  connectWallet: async () => {
    set({ isLoading: true, error: null });
    
    try {
      let account: string;
      let provider: ethers.BrowserProvider;
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        console.warn("MetaMask is not installed. Using mock wallet for development.");
        
        // Use a mock wallet for development/testing
        account = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
        
        // Create a mock provider
        provider = {
          getNetwork: async () => ({ chainId: BigInt(DEFAULT_CHAIN_ID) }),
          getSigner: async () => ({
            getAddress: async () => account,
            provider: provider
          })
        } as unknown as ethers.BrowserProvider;
        
        console.log("Connected with mock wallet:", account);
      } else {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts found. Please make sure you are logged into MetaMask.");
        }
        
        account = accounts[0];
        
        // Create ethers provider
        provider = new ethers.BrowserProvider(window.ethereum);
        
        // Get the network
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        
        // Check if we're on Base Goerli Testnet
        if (chainId !== DEFAULT_CHAIN_ID) {
          // Prompt user to switch to Base Goerli Testnet
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${DEFAULT_CHAIN_ID.toString(16)}` }],
            });
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: `0x${DEFAULT_CHAIN_ID.toString(16)}`,
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
                throw new Error("Failed to add Base Goerli Testnet to MetaMask. Please add it manually.");
              }
            } else {
              throw new Error("Failed to switch to Base Goerli Testnet. Please switch manually in MetaMask.");
            }
          }
          
          // Refresh provider after network switch
          provider = new ethers.BrowserProvider(window.ethereum);
        }
        
        console.log("Connected with MetaMask:", account);
      }
      
      // Set the connection
      set({ 
        provider,
        account, 
        isConnected: true 
      });
      
      // Initialize contract
      await get().initializeContract();
      
      // Simulate loading some pixel data
      setTimeout(() => {
        const pixels = new Map<number, PixelData>();
        const currentAccount = get().account || '';
        
        // Add some random pixels
        for (let i = 0; i < 10; i++) {
          const pixelId = Math.floor(Math.random() * 1000000);
          const x = pixelId % CANVAS_CONFIG.gridSize;
          const y = Math.floor(pixelId / CANVAS_CONFIG.gridSize);
          pixels.set(pixelId, {
            id: pixelId,
            x,
            y,
            owner: i % 2 === 0 ? currentAccount : ethers.ZeroAddress,
            color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
          });
        }
        
        // Add some specific pixels that we know are owned
        // These will be visible on the canvas and can be clicked to see the owner
        const ownedPixels = [
          { x: 10, y: 10 },  // Block coordinates (1, 1) * BLOCK_SIZE
          { x: 20, y: 20 },  // Block coordinates (2, 2) * BLOCK_SIZE
          { x: 30, y: 30 },  // Block coordinates (3, 3) * BLOCK_SIZE
          { x: 40, y: 40 },  // Block coordinates (4, 4) * BLOCK_SIZE
          { x: 50, y: 50 }   // Block coordinates (5, 5) * BLOCK_SIZE
        ];
        
        ownedPixels.forEach((pixel, index) => {
          // Calculate pixelId using block coordinates
          const blockX = pixel.x / 10;  // Convert to block coordinates
          const blockY = pixel.y / 10;  // Convert to block coordinates
          const pixelId = blockY * CANVAS_CONFIG.gridSize + blockX;
          
          pixels.set(pixelId, {
            id: pixelId,
            x: pixel.x,
            y: pixel.y,
            owner: currentAccount,
            color: index % 2 === 0 ? '#FF5733' : '#3357FF'
          });
          
          console.log(`Added owned pixel at (${pixel.x}, ${pixel.y}), pixelId: ${pixelId}, owner: ${currentAccount}`);
        });
        
        set({ pixels });
      }, 1000);
      
    } catch (error) {
      console.error("Error connecting wallet:", error);
      set({ error: error instanceof Error ? error.message : "Failed to connect wallet" });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Disconnect wallet
  disconnectWallet: () => {
    set({ 
      isConnected: false, 
      account: null, 
      provider: null,
      contract: null,
      selectedPixel: null
    });
  },
  
  // Initialize contract
  initializeContract: async () => {
    const { provider, contractAddress } = get();
    
    if (!provider) {
      set({ error: "Provider not available" });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const contract = new PixelOwnershipContract(contractAddress, provider);
      await contract.initialize();
      
      const gridSize = contract.getGridSize();
      const pixelPrice = await contract.getPixelPrice();
      
      set({ contract, gridSize, pixelPrice });
      
      // Set up event listeners - these are already wrapped in try-catch blocks in the contract interface
      contract.onPixelClaimed((owner, pixelId, x, y) => {
        const pixels = new Map(get().pixels);
        pixels.set(pixelId, { id: pixelId, x, y, owner, color: "#FFFFFF" });
        set({ pixels });
      });
      
      contract.onPixelColorChanged((pixelId, newColor) => {
        const pixels = new Map(get().pixels);
        const pixel = pixels.get(pixelId);
        if (pixel) {
          pixels.set(pixelId, { ...pixel, color: newColor });
          set({ pixels });
        }
      });
      
      contract.onPixelTransferred((from, to, pixelId) => {
        const pixels = new Map(get().pixels);
        const pixel = pixels.get(pixelId);
        if (pixel) {
          pixels.set(pixelId, { ...pixel, owner: to });
          set({ pixels });
        }
      });
      
    } catch (error) {
      console.error("Error initializing contract:", error);
      set({ error: error instanceof Error ? error.message : "Failed to initialize contract" });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Load pixel data with caching
  loadPixelData: async (pixelId: number) => {
    const { contract, pixels } = get();
    
    if (!contract) {
      set({ error: "Contract not initialized" });
      return;
    }
    
    // Check if we already have this pixel data in cache
    if (pixels.has(pixelId)) {
      return; // Use cached data instead of making an API call
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const { owner, color } = await contract.getPixelInfo(pixelId);
      const { x, y } = contract.getGridSize() ? 
        { x: pixelId % contract.getGridSize(), y: Math.floor(pixelId / contract.getGridSize()) } : 
        { x: 0, y: 0 };
      
      const newPixels = new Map(pixels);
      newPixels.set(pixelId, { id: pixelId, x, y, owner, color });
      
      set({ pixels: newPixels });
    } catch (error) {
      console.error("Error loading pixel data:", error);
      set({ error: error instanceof Error ? error.message : "Failed to load pixel data" });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Load pixel data by coordinates with caching
  loadPixelDataByCoordinates: async (x: number, y: number) => {
    const { contract, gridSize, pixels } = get();
    
    if (!contract) {
      set({ error: "Contract not initialized" });
      return;
    }
    
    try {
      const pixelId = y * gridSize + x;
      
      // Check if we already have this pixel data in cache
      if (pixels.has(pixelId)) {
        return; // Use cached data instead of making an API call
      }
      
      await get().loadPixelData(pixelId);
    } catch (error) {
      console.error("Error loading pixel data by coordinates:", error);
      set({ error: error instanceof Error ? error.message : "Failed to load pixel data" });
    }
  },
  
  // Select a pixel
  selectPixel: (pixelId: number | null) => {
    if (pixelId === null) {
      set({ selectedPixel: null });
      return;
    }
    
    const { pixels, gridSize } = get();
    let pixel = pixels.get(pixelId);
    
    if (!pixel) {
      // If we don't have the pixel data yet, create a placeholder
      const x = pixelId % gridSize;
      const y = Math.floor(pixelId / gridSize);
      pixel = { id: pixelId, x, y, owner: '', color: '#FFFFFF' };
      
      // Load the actual data in the background
      get().loadPixelData(pixelId);
    }
    
    set({ selectedPixel: pixel });
  },
  
  // Claim the selected pixel with optimized updates
  claimSelectedPixel: async () => {
    const { contract, selectedPixel, pixelPrice, account, pixels } = get();
    
    if (!contract || !selectedPixel || !pixelPrice || !account) {
      console.error("Missing data:", { contract, selectedPixel, pixelPrice, account });
      set({ error: "Cannot claim pixel: missing required data" });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      // For development/testing: Use a mock transaction
      console.log(`Claiming pixel at (${selectedPixel.x}, ${selectedPixel.y}) for ${pixelPrice} wei`);
      
      // Simulate a transaction
      const mockTx = {
        wait: async () => {
          // Simulate transaction confirmation delay
          await new Promise(resolve => setTimeout(resolve, 500));
          return {};
        }
      };
      
      await mockTx.wait();
      
      // Update the pixel data locally
      const newPixels = new Map(pixels);
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
      
      newPixels.set(selectedPixel.id, {
        ...selectedPixel,
        owner: account,
        color: randomColor
      });
      
      set({ pixels: newPixels });
      
    } catch (error) {
      console.error("Error claiming pixel:", error);
      set({ error: error instanceof Error ? error.message : "Failed to claim pixel" });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Change pixel color with optimized updates
  changePixelColor: async (pixelId: number, color: string) => {
    const { contract, account, pixels } = get();
    
    if (!contract || !account) {
      set({ error: "Cannot change color: not connected" });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const tx = await contract.changePixelColor(pixelId, color);
      await tx.wait();
      
      // Update the pixel data locally instead of making another API call
      const pixel = pixels.get(pixelId);
      if (pixel) {
        const newPixels = new Map(pixels);
        newPixels.set(pixelId, {
          ...pixel,
          color: color
        });
        
        set({ pixels: newPixels });
      }
      
    } catch (error) {
      console.error("Error changing pixel color:", error);
      set({ error: error instanceof Error ? error.message : "Failed to change pixel color" });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Claim multiple pixels with batching
  claimMultiplePixels: async (pixelCoords: {x: number, y: number}[]) => {
    const { contract, pixelPrice, account, gridSize, pixels } = get();
    
    if (!contract || !pixelPrice || !account) {
      console.error("Missing data:", { contract, pixelPrice, account });
      set({ error: "Cannot claim pixels: missing required data" });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      // For development/testing: Use a mock transaction
      console.log(`Batch claiming ${pixelCoords.length} pixels in a single transaction`);
      
      // Simulate a transaction
      const mockTx = {
        wait: async () => {
          // Simulate transaction confirmation delay
          await new Promise(resolve => setTimeout(resolve, 500));
          return {};
        }
      };
      
      await mockTx.wait();
      
      // Update all pixel data in memory
      const newPixels = new Map(pixels);
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
      
      pixelCoords.forEach(coord => {
        const pixelId = coord.y * gridSize + coord.x;
        newPixels.set(pixelId, {
          id: pixelId,
          x: coord.x * BLOCK_SIZE, // Convert to canvas coordinates
          y: coord.y * BLOCK_SIZE, // Convert to canvas coordinates
          owner: account || '',
          color: randomColor
        });
      });
      
      // Update the store with all changes at once
      set({ pixels: newPixels });
      
    } catch (error) {
      console.error("Error claiming multiple pixels:", error);
      set({ error: error instanceof Error ? error.message : "Failed to claim pixels" });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Set error
  setError: (error: string | null) => {
    set({ error });
  }
}));
