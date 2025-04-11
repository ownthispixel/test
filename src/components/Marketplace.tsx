import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { usePixelStore } from '../store/usePixelStore';
import { formatAddress, formatEth, pixelIdToCoordinates } from '../utils/helpers';
import { CANVAS_CONFIG } from '../utils/config';

interface PixelListing {
  id: number;
  x: number;
  y: number;
  owner: string;
  price: bigint;
  color: string;
}

interface ChunkListing {
  startX: number;
  startY: number;
  width: number;
  height: number;
  price: bigint;
  owner: string;
}

const Marketplace: React.FC = () => {
  const { 
    isConnected, 
    account, 
    contract, 
    pixelPrice, 
    loadPixelData,
    pixels,
    isLoading,
    error,
    setError
  } = usePixelStore();

  const [pixelListings, setPixelListings] = useState<PixelListing[]>([]);
  const [chunkListings, setChunkListings] = useState<ChunkListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<PixelListing | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<ChunkListing | null>(null);
  const [customChunk, setCustomChunk] = useState({
    startX: 0,
    startY: 0,
    width: 2,
    height: 2
  });
  const [isCreatingChunk, setIsCreatingChunk] = useState(false);
  const [chunkPrice, setChunkPrice] = useState<string>("0.02");

  // Mock data for demonstration - in a real app, these would come from the contract
  useEffect(() => {
    // Simulate loading pixel listings
    const mockPixelListings: PixelListing[] = [
      { id: 1, x: 5, y: 5, owner: "0x1234567890123456789012345678901234567890", price: BigInt(10000000000000000), color: "#FF5733" },
      { id: 2, x: 10, y: 15, owner: "0x1234567890123456789012345678901234567890", price: BigInt(15000000000000000), color: "#33FF57" },
      { id: 3, x: 25, y: 30, owner: "0x2345678901234567890123456789012345678901", price: BigInt(20000000000000000), color: "#5733FF" },
      { id: 4, x: 40, y: 45, owner: "0x3456789012345678901234567890123456789012", price: BigInt(25000000000000000), color: "#FF33A1" },
      { id: 5, x: 55, y: 60, owner: "0x4567890123456789012345678901234567890123", price: BigInt(30000000000000000), color: "#33A1FF" }
    ];
    
    const mockChunkListings: ChunkListing[] = [
      { startX: 100, startY: 100, width: 10, height: 10, price: BigInt(100000000000000000), owner: "0x1234567890123456789012345678901234567890" },
      { startX: 200, startY: 200, width: 5, height: 5, price: BigInt(50000000000000000), owner: "0x2345678901234567890123456789012345678901" },
      { startX: 300, startY: 300, width: 20, height: 20, price: BigInt(200000000000000000), owner: "0x3456789012345678901234567890123456789012" }
    ];
    
    setPixelListings(mockPixelListings);
    setChunkListings(mockChunkListings);
  }, []);

  const handleBuyPixel = async (listing: PixelListing) => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    try {
      // In a real implementation, this would call the contract to purchase the pixel
      alert(`Buying pixel at (${listing.x}, ${listing.y}) for ${formatEth(listing.price)} ETH`);
      
      // Simulate successful purchase
      setPixelListings(prevListings => 
        prevListings.filter(item => item.id !== listing.id)
      );
      
      setSelectedListing(null);
    } catch (error) {
      console.error("Error buying pixel:", error);
      setError(error instanceof Error ? error.message : "Failed to buy pixel");
    }
  };

  const handleBuyChunk = async (chunk: ChunkListing) => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    try {
      // In a real implementation, this would call the contract to purchase the chunk
      alert(`Buying chunk at (${chunk.startX}, ${chunk.startY}) with size ${chunk.width}x${chunk.height} for ${formatEth(chunk.price)} ETH`);
      
      // Simulate successful purchase
      setChunkListings(prevListings => 
        prevListings.filter(item => 
          !(item.startX === chunk.startX && 
            item.startY === chunk.startY && 
            item.width === chunk.width && 
            item.height === chunk.height)
        )
      );
      
      setSelectedChunk(null);
    } catch (error) {
      console.error("Error buying chunk:", error);
      setError(error instanceof Error ? error.message : "Failed to buy chunk");
    }
  };

  const handleCreateChunk = () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    try {
      // In a real implementation, this would call the contract to list the chunk
      const newChunk: ChunkListing = {
        startX: customChunk.startX,
        startY: customChunk.startY,
        width: customChunk.width,
        height: customChunk.height,
        price: ethers.parseEther(chunkPrice),
        owner: account || "0x0000000000000000000000000000000000000000"
      };
      
      setChunkListings(prev => [...prev, newChunk]);
      setIsCreatingChunk(false);
      
      // Reset form
      setCustomChunk({
        startX: 0,
        startY: 0,
        width: 2,
        height: 2
      });
      setChunkPrice("0.02");
      
      alert(`Listed chunk at (${newChunk.startX}, ${newChunk.startY}) with size ${newChunk.width}x${newChunk.height} for ${chunkPrice} ETH`);
    } catch (error) {
      console.error("Error creating chunk listing:", error);
      setError(error instanceof Error ? error.message : "Failed to create chunk listing");
    }
  };

  return (
    <div className="marketplace">
      <h2>Pixel Marketplace</h2>
      <p>Buy and sell individual pixels or chunks of pixels on the canvas.</p>
      
      {error && (
        <div className="error-message">
          {error}
          <button className="close-button" onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      <div className="marketplace-tabs">
        <button 
          className={`tab-button ${!isCreatingChunk ? 'active' : ''}`}
          onClick={() => setIsCreatingChunk(false)}
        >
          Browse Listings
        </button>
        <button 
          className={`tab-button ${isCreatingChunk ? 'active' : ''}`}
          onClick={() => setIsCreatingChunk(true)}
        >
          Create Listing
        </button>
      </div>
      
      {!isCreatingChunk ? (
        <div className="listings-container">
          <div className="listings-section">
            <h3>Individual Pixels</h3>
            {pixelListings.length === 0 ? (
              <p>No individual pixels currently listed for sale.</p>
            ) : (
              <div className="listings-grid">
                {pixelListings.map(listing => (
                  <div 
                    key={listing.id} 
                    className={`listing-card ${selectedListing?.id === listing.id ? 'selected' : ''}`}
                    onClick={() => setSelectedListing(listing)}
                  >
                    <div 
                      className="pixel-preview" 
                      style={{ backgroundColor: listing.color }}
                    ></div>
                    <div className="listing-details">
                      <p>Position: ({listing.x}, {listing.y})</p>
                      <p>Price: {formatEth(listing.price)} ETH</p>
                      <p>Owner: {formatAddress(listing.owner)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="listings-section">
            <h3>Pixel Chunks</h3>
            {chunkListings.length === 0 ? (
              <p>No pixel chunks currently listed for sale.</p>
            ) : (
              <div className="listings-grid">
                {chunkListings.map((chunk, index) => (
                  <div 
                    key={index} 
                    className={`listing-card ${selectedChunk === chunk ? 'selected' : ''}`}
                    onClick={() => setSelectedChunk(chunk)}
                  >
                    <div className="chunk-preview">
                      <div className="chunk-size">{chunk.width}×{chunk.height}</div>
                    </div>
                    <div className="listing-details">
                      <p>Position: ({chunk.startX}, {chunk.startY})</p>
                      <p>Size: {chunk.width}×{chunk.height} pixels</p>
                      <p>Price: {formatEth(chunk.price)} ETH</p>
                      <p>Owner: {formatAddress(chunk.owner)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="selected-listing">
            {selectedListing && (
              <div className="selected-details card">
                <h3>Selected Pixel</h3>
                <div className="selected-preview" style={{ backgroundColor: selectedListing.color }}></div>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Position:</span>
                    <span className="detail-value">({selectedListing.x}, {selectedListing.y})</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">{formatEth(selectedListing.price)} ETH</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Owner:</span>
                    <span className="detail-value">{formatAddress(selectedListing.owner)}</span>
                  </div>
                </div>
                <button 
                  className="buy-button"
                  onClick={() => handleBuyPixel(selectedListing)}
                  disabled={!isConnected || isLoading}
                >
                  {isLoading ? 'Processing...' : 'Buy Pixel'}
                </button>
              </div>
            )}
            
            {selectedChunk && (
              <div className="selected-details card">
                <h3>Selected Chunk</h3>
                <div className="selected-preview chunk">
                  <div className="chunk-size">{selectedChunk.width}×{selectedChunk.height}</div>
                </div>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Position:</span>
                    <span className="detail-value">({selectedChunk.startX}, {selectedChunk.startY})</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Size:</span>
                    <span className="detail-value">{selectedChunk.width}×{selectedChunk.height} pixels</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Pixels:</span>
                    <span className="detail-value">{selectedChunk.width * selectedChunk.height}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">{formatEth(selectedChunk.price)} ETH</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Owner:</span>
                    <span className="detail-value">{formatAddress(selectedChunk.owner)}</span>
                  </div>
                </div>
                <button 
                  className="buy-button"
                  onClick={() => handleBuyChunk(selectedChunk)}
                  disabled={!isConnected || isLoading}
                >
                  {isLoading ? 'Processing...' : 'Buy Chunk'}
                </button>
              </div>
            )}
            
            {!selectedListing && !selectedChunk && (
              <div className="selected-details card">
                <h3>Marketplace Info</h3>
                <p>Select a pixel or chunk listing to view details and purchase options.</p>
                <div className="info-section">
                  <h4>How It Works</h4>
                  <ol>
                    <li>Browse available individual pixels or pixel chunks</li>
                    <li>Select a listing to view details</li>
                    <li>Connect your wallet if you haven't already</li>
                    <li>Click "Buy" to purchase the selected listing</li>
                    <li>Confirm the transaction in your wallet</li>
                  </ol>
                </div>
                <div className="info-section">
                  <h4>Creating Listings</h4>
                  <p>You can also create your own listings by:</p>
                  <ol>
                    <li>Clicking the "Create Listing" tab</li>
                    <li>Specifying the pixel coordinates or chunk dimensions</li>
                    <li>Setting your desired price</li>
                    <li>Creating the listing</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="create-listing-form card">
          <h3>Create Chunk Listing</h3>
          <p>Define a chunk of pixels to list for sale.</p>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Starting X Coordinate:</label>
              <input 
                type="number" 
                min="0" 
                max={CANVAS_CONFIG.gridSize - customChunk.width}
                value={customChunk.startX}
                onChange={(e) => setCustomChunk({...customChunk, startX: parseInt(e.target.value) || 0})}
              />
            </div>
            
            <div className="form-group">
              <label>Starting Y Coordinate:</label>
              <input 
                type="number" 
                min="0" 
                max={CANVAS_CONFIG.gridSize - customChunk.height}
                value={customChunk.startY}
                onChange={(e) => setCustomChunk({...customChunk, startY: parseInt(e.target.value) || 0})}
              />
            </div>
            
            <div className="form-group">
              <label>Width (pixels):</label>
              <input 
                type="number" 
                min="2" 
                max="50"
                value={customChunk.width}
                onChange={(e) => setCustomChunk({...customChunk, width: parseInt(e.target.value) || 2})}
              />
            </div>
            
            <div className="form-group">
              <label>Height (pixels):</label>
              <input 
                type="number" 
                min="2" 
                max="50"
                value={customChunk.height}
                onChange={(e) => setCustomChunk({...customChunk, height: parseInt(e.target.value) || 2})}
              />
            </div>
            
            <div className="form-group">
              <label>Price (ETH):</label>
              <input 
                type="text" 
                value={chunkPrice}
                onChange={(e) => setChunkPrice(e.target.value)}
                placeholder="0.02"
              />
            </div>
          </div>
          
          <div className="chunk-preview-container">
            <h4>Preview:</h4>
            <div className="chunk-preview-large">
              <div className="chunk-size-preview">
                {customChunk.width}×{customChunk.height}
              </div>
              <div className="chunk-coordinates">
                Starting at ({customChunk.startX}, {customChunk.startY})
              </div>
              <div className="chunk-total-pixels">
                Total: {customChunk.width * customChunk.height} pixels
              </div>
              <div className="chunk-total-price">
                Price: {chunkPrice} ETH
              </div>
            </div>
          </div>
          
          <button 
            className="create-button"
            onClick={handleCreateChunk}
            disabled={!isConnected || isLoading}
          >
            {isLoading ? 'Processing...' : 'Create Listing'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
