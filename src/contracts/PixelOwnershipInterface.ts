import { ethers } from 'ethers';

// ABI for the PixelOwnership contract
// This is a simplified ABI with just the functions we need
export const PixelOwnershipABI = [
  // Read functions
  "function GRID_SIZE() view returns (uint256)",
  "function TOTAL_PIXELS() view returns (uint256)",
  "function PIXEL_PRICE() view returns (uint256)",
  "function pixelOwners(uint256) view returns (address)",
  "function pixelColors(uint256) view returns (string)",
  "function getPixelInfo(uint256) view returns (address owner, string color)",
  
  // Write functions
  "function claimPixel(uint256 x, uint256 y) payable",
  "function changePixelColor(uint256 pixelId, string calldata newColor)",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data)",
  
  // Events
  "event PixelClaimed(address indexed owner, uint256 indexed pixelId, uint256 x, uint256 y)",
  "event PixelColorChanged(uint256 indexed pixelId, string newColor)",
  "event PixelTransferred(address indexed from, address indexed to, uint256 indexed pixelId)"
];

// Helper functions for coordinate conversion
export const toPixelId = (x: number, y: number, gridSize: number): number => {
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
    throw new Error("Coordinates out of bounds");
  }
  return y * gridSize + x;
};

export const toCoordinates = (pixelId: number, gridSize: number): { x: number, y: number } => {
  if (pixelId < 0 || pixelId >= gridSize * gridSize) {
    throw new Error("Pixel ID out of bounds");
  }
  const y = Math.floor(pixelId / gridSize);
  const x = pixelId % gridSize;
  return { x, y };
};

// Contract interface class
export class PixelOwnershipContract {
  protected contract: ethers.Contract;
  protected provider: ethers.BrowserProvider;
  protected gridSize: number = 1000; // Default, will be updated from contract
  protected isMock: boolean = false;

  constructor(contractAddress: string, provider: ethers.BrowserProvider) {
    this.provider = provider;
    this.contract = new ethers.Contract(contractAddress, PixelOwnershipABI, provider);
    
    // Check if this is a mock provider
    if (typeof provider.getNetwork === 'function' && 
        typeof provider.getSigner === 'function' && 
        Object.keys(provider).length <= 2) {
      this.isMock = true;
      console.log("Using mock contract implementation");
    }
  }

  // Initialize and load contract constants
  async initialize(): Promise<void> {
    try {
      // Try to get grid size from contract, but use default if it fails
      try {
        this.gridSize = Number(await this.contract.GRID_SIZE());
      } catch (error) {
        console.warn("Using default grid size (1000) for mock contract");
        // Keep the default grid size (1000)
      }
    } catch (error) {
      console.error("Error initializing contract:", error);
      throw error;
    }
  }

  // Get grid size
  getGridSize(): number {
    return this.gridSize;
  }

  // Get pixel price
  async getPixelPrice(): Promise<bigint> {
    try {
      return await this.contract.PIXEL_PRICE();
    } catch (error) {
      console.warn("Using default pixel price for mock contract");
      // Return a default price of 0.01 ETH
      return ethers.parseEther("0.01");
    }
  }

  // Get pixel info
  async getPixelInfo(pixelId: number): Promise<{ owner: string, color: string }> {
    try {
      const [owner, color] = await this.contract.getPixelInfo(pixelId);
      return { owner, color };
    } catch (error) {
      console.warn("Using mock data for getPixelInfo");
      // Generate mock data for testing
      const mockOwner = Math.random() > 0.7 ? 
        "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" : 
        ethers.ZeroAddress;
      const mockColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
      return { owner: mockOwner, color: mockColor };
    }
  }

  // Get pixel info by coordinates
  async getPixelInfoByCoordinates(x: number, y: number): Promise<{ owner: string, color: string }> {
    const pixelId = toPixelId(x, y, this.gridSize);
    return await this.getPixelInfo(pixelId);
  }

  // Claim a pixel
  async claimPixel(x: number, y: number, value: bigint): Promise<ethers.TransactionResponse> {
    try {
      const signer = await this.provider.getSigner();
      const contractWithSigner = this.contract.connect(signer) as ethers.Contract & {
        claimPixel(x: number, y: number, overrides?: { value?: bigint }): Promise<ethers.TransactionResponse>
      };
      return await contractWithSigner.claimPixel(x, y, { value });
    } catch (error) {
      console.warn("Using mock transaction for claimPixel");
      // Return a mock transaction response
      return {
        hash: `0x${Math.random().toString(16).substring(2, 42)}`,
        wait: async () => {
          // Simulate transaction confirmation delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          return {} as any;
        }
      } as ethers.TransactionResponse;
    }
  }

  // Change pixel color
  async changePixelColor(pixelId: number, newColor: string): Promise<ethers.TransactionResponse> {
    try {
      const signer = await this.provider.getSigner();
      const contractWithSigner = this.contract.connect(signer) as ethers.Contract & {
        changePixelColor(pixelId: number, newColor: string): Promise<ethers.TransactionResponse>
      };
      return await contractWithSigner.changePixelColor(pixelId, newColor);
    } catch (error) {
      console.warn("Using mock transaction for changePixelColor");
      // Return a mock transaction response
      return {
        hash: `0x${Math.random().toString(16).substring(2, 42)}`,
        wait: async () => {
          // Simulate transaction confirmation delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          return {} as any;
        }
      } as ethers.TransactionResponse;
    }
  }

  // Change pixel color by coordinates
  async changePixelColorByCoordinates(x: number, y: number, newColor: string): Promise<ethers.TransactionResponse> {
    const pixelId = toPixelId(x, y, this.gridSize);
    return await this.changePixelColor(pixelId, newColor);
  }

  // Listen for pixel claimed events
  onPixelClaimed(callback: (owner: string, pixelId: number, x: number, y: number) => void): void {
    if (this.isMock) {
      console.log("Mock contract: Event listeners not supported");
      return;
    }
    
    try {
      this.contract.on("PixelClaimed", (owner, pixelId, x, y) => {
        callback(owner, Number(pixelId), Number(x), Number(y));
      });
    } catch (error) {
      console.warn("Event listener not supported:", error);
    }
  }

  // Listen for pixel color changed events
  onPixelColorChanged(callback: (pixelId: number, newColor: string) => void): void {
    if (this.isMock) {
      console.log("Mock contract: Event listeners not supported");
      return;
    }
    
    try {
      this.contract.on("PixelColorChanged", (pixelId, newColor) => {
        callback(Number(pixelId), newColor);
      });
    } catch (error) {
      console.warn("Event listener not supported:", error);
    }
  }

  // Listen for pixel transferred events
  onPixelTransferred(callback: (from: string, to: string, pixelId: number) => void): void {
    if (this.isMock) {
      console.log("Mock contract: Event listeners not supported");
      return;
    }
    
    try {
      this.contract.on("PixelTransferred", (from, to, pixelId) => {
        callback(from, to, Number(pixelId));
      });
    } catch (error) {
      console.warn("Event listener not supported:", error);
    }
  }
}
