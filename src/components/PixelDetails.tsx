import React, { useState, useRef } from 'react';
import { ethers } from 'ethers';
import { usePixelStore } from '../store/usePixelStore';
import { formatAddress, formatEth, isValidHexColor, pixelIdToCoordinates } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

interface MultiPixelSelectionProps {
  selectedPixels: number[];
  onClear: () => void;
}

const MultiPixelSelection: React.FC<MultiPixelSelectionProps> = ({ selectedPixels, onClear }) => {
  const { 
    gridSize,
    account, 
    isConnected, 
    pixelPrice, 
    isLoading, 
    error, 
    setError 
  } = usePixelStore();
  
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Calculate total price
  const totalPrice = pixelPrice ? pixelPrice * BigInt(selectedPixels.length) : BigInt(0);
  
  // Handle bulk purchase
  const handleBulkPurchase = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    if (selectedPixels.length === 0) {
      setError("No pixels selected");
      return;
    }
    
    try {
      // In a real implementation, this would call a contract method to purchase multiple pixels
      alert(`This would purchase ${selectedPixels.length} pixels for ${formatEth(totalPrice)} ETH`);
    } catch (error) {
      console.error("Error purchasing pixels:", error);
      setError(error instanceof Error ? error.message : "Failed to purchase pixels");
    }
  };
  
  // Get coordinates for display
  const getCoordinatesString = () => {
    if (selectedPixels.length <= 3) {
      return selectedPixels.map(id => {
        const { x, y } = pixelIdToCoordinates(id, gridSize);
        return `(${x}, ${y})`;
      }).join(', ');
    } else {
      const firstPixel = pixelIdToCoordinates(selectedPixels[0], gridSize);
      const lastPixel = pixelIdToCoordinates(selectedPixels[selectedPixels.length - 1], gridSize);
      return `(${firstPixel.x}, ${firstPixel.y}) to (${lastPixel.x}, ${lastPixel.y}) and ${selectedPixels.length - 2} more`;
    }
  };
  
  return (
    <div className="multi-pixel-selection">
      <div className="selection-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h4>Multiple Pixels Selected ({selectedPixels.length})</h4>
        <button className="toggle-button">{isExpanded ? '▼' : '▶'}</button>
      </div>
      
      {isExpanded && (
        <div className="selection-content">
          <div className="selection-details">
            <div className="detail-item">
              <span className="detail-label">Pixels:</span>
              <span className="detail-value">{selectedPixels.length}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Coordinates:</span>
              <span className="detail-value">{getCoordinatesString()}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Total Price:</span>
              <span className="detail-value">{formatEth(totalPrice)} ETH</span>
            </div>
          </div>
          
          <div className="selection-actions">
            <button 
              onClick={handleBulkPurchase} 
              disabled={isLoading || !isConnected}
              className="purchase-button"
            >
              {isLoading ? 'Processing...' : 'Purchase All'}
            </button>
            
            <button 
              onClick={onClear}
              className="cancel-button"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PixelDetails: React.FC<{ 
  selectedPixels?: number[];
  onClear?: () => void;
}> = ({ selectedPixels = [], onClear }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    selectedPixel, 
    account, 
    isConnected, 
    pixelPrice, 
    claimSelectedPixel, 
    changePixelColor, 
    isLoading, 
    error, 
    setError 
  } = usePixelStore();
  
  const [colorInput, setColorInput] = useState('#FFFFFF');
  const [isImageUploadMode, setIsImageUploadMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Check if the current user owns the selected pixel
  const isOwner = selectedPixel && account && selectedPixel.owner === account;
  
  // Check if the pixel is available to claim
  const isAvailable = selectedPixel && (!selectedPixel.owner || selectedPixel.owner === ethers.ZeroAddress);
  
  // Check if the pixel is listed in the marketplace
  const isListed = selectedPixel && selectedPixel.owner !== ethers.ZeroAddress && selectedPixel.owner !== account;
  
  // Handle claim button click
  const handleClaim = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    if (!selectedPixel) {
      setError("No pixel selected");
      return;
    }
    
    if (!isAvailable) {
      setError("This pixel is already owned");
      return;
    }
    
    try {
      await claimSelectedPixel();
    } catch (error) {
      console.error("Error claiming pixel:", error);
      setError(error instanceof Error ? error.message : "Failed to claim pixel");
    }
  };
  
  // Handle color change
  const handleColorChange = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    if (!selectedPixel) {
      setError("No pixel selected");
      return;
    }
    
    if (!isOwner) {
      setError("You don't own this pixel");
      return;
    }
    
    // Validate color format
    if (!isValidHexColor(colorInput)) {
      setError("Invalid color format. Use #RRGGBB");
      return;
    }
    
    try {
      await changePixelColor(selectedPixel.id, colorInput);
    } catch (error) {
      console.error("Error changing color:", error);
      setError(error instanceof Error ? error.message : "Failed to change color");
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(event.target?.result as string);
        setIsImageUploadMode(true);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  // Apply image to pixel
  const applyImageToPixel = () => {
    if (!uploadedImage || !selectedPixel || !isOwner) return;
    
    // This would be implemented to extract color from the image and apply it to the pixel
    // For now, we'll just show a placeholder implementation
    alert('Image would be applied to the pixel. This feature is under development.');
    
    // Reset image upload mode
    setIsImageUploadMode(false);
    setUploadedImage(null);
  };
  
  // Handle view in marketplace
  const handleViewInMarketplace = () => {
    navigate('/marketplace');
  };
  
  // Clear multi-pixel selection
  const handleClearSelection = () => {
    if (onClear) {
      onClear();
    }
  };
  
  // If multi-pixel selection is active, show that instead
  if (selectedPixels.length > 0) {
    return (
      <div className="pixel-details card">
        <h3>Selection Details</h3>
        
        {error && (
          <div className="error-message">
            {error}
            <button className="close-button" onClick={() => setError(null)}>×</button>
          </div>
        )}
        
        <MultiPixelSelection 
          selectedPixels={selectedPixels} 
          onClear={handleClearSelection} 
        />
      </div>
    );
  }
  
  // If no pixel is selected, show a message
  if (!selectedPixel) {
    return (
      <div className="pixel-details card">
        <h3>Pixel Details</h3>
        <p>Select a pixel on the canvas to view details</p>
        <p>Or use "Select Multiple" to select a chunk of pixels</p>
      </div>
    );
  }
  
  return (
    <div className="pixel-details card">
      <h3>Pixel Details</h3>
      
      {error && (
        <div className="error-message">
          {error}
          <button className="close-button" onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Coordinates:</span>
          <span className="detail-value">({selectedPixel.x}, {selectedPixel.y})</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Pixel ID:</span>
          <span className="detail-value">{selectedPixel.id}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Owner:</span>
          <span className="detail-value">
            {formatAddress(selectedPixel.owner)}
            {isOwner && <span className="owner-badge"> (You)</span>}
          </span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Color:</span>
          <div className="color-display">
            <div 
              className="color-swatch" 
              style={{ backgroundColor: selectedPixel.color }}
            ></div>
            <span>{selectedPixel.color}</span>
          </div>
        </div>
      </div>
      
      {isAvailable && (
        <div className="action-section">
          <h4>Claim This Pixel</h4>
          <p>Price: {pixelPrice ? formatEth(pixelPrice) : '0.01'} ETH</p>
          <button 
            onClick={handleClaim} 
            disabled={isLoading || !isConnected}
            className="claim-button"
          >
            {isLoading ? 'Processing...' : 'Claim Pixel'}
          </button>
        </div>
      )}
      
      {isListed && (
        <div className="action-section">
          <h4>Pixel Listed for Sale</h4>
          <button 
            onClick={handleViewInMarketplace} 
            className="marketplace-button"
          >
            View in Marketplace
          </button>
        </div>
      )}
      
      {isOwner && (
        <>
          <div className="action-section">
            <h4>Change Color</h4>
            <div className="color-input-container">
              <input 
                type="color" 
                value={colorInput} 
                onChange={(e) => setColorInput(e.target.value)} 
                className="color-picker"
              />
              <input 
                type="text" 
                value={colorInput} 
                onChange={(e) => setColorInput(e.target.value)} 
                placeholder="#RRGGBB" 
                className="color-text-input"
              />
              <button 
                onClick={handleColorChange} 
                disabled={isLoading}
                className="color-button"
              >
                {isLoading ? 'Processing...' : 'Update'}
              </button>
            </div>
          </div>
          
          <div className="action-section">
            <h4>Apply Image</h4>
            <div className="image-upload-container">
              <input 
                type="file" 
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="upload-button"
              >
                Upload Image
              </button>
              
              {isImageUploadMode && uploadedImage && (
                <>
                  <div className="image-preview">
                    <img 
                      src={uploadedImage} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '100px' }}
                    />
                  </div>
                  <button 
                    onClick={applyImageToPixel}
                    className="apply-button"
                  >
                    Apply to Pixel
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="action-section">
            <h4>List for Sale</h4>
            <button 
              onClick={handleViewInMarketplace}
              className="list-button"
            >
              List in Marketplace
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PixelDetails;
