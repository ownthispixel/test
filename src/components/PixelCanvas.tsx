import React, { useEffect, useRef, useState } from 'react';
import { usePixelStore } from '../store/usePixelStore';
import { formatEth, formatAddress } from '../utils/helpers';

interface PixelCanvasProps {
  onPixelsSelected?: (pixels: {x: number, y: number}[]) => void;
}

const PixelCanvas: React.FC<PixelCanvasProps> = ({ onPixelsSelected }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<string>('Ready - Click on a pixel block to select it');
  const [selectedBlocks, setSelectedBlocks] = useState<{x: number, y: number}[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  
  const { 
    pixelPrice, 
    pixels, 
    account,
    isConnected,
    gridSize,
    claimSelectedPixel,
    claimMultiplePixels
  } = usePixelStore();

  const BLOCK_SIZE = 10; // Each pixel block is 10x10
  const CANVAS_SIZE = 1000; // 1000x1000 canvas
  
  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw grid lines
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;
    
    // Draw vertical grid lines
    for (let x = 0; x <= CANVAS_SIZE; x += BLOCK_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_SIZE);
      ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let y = 0; y <= CANVAS_SIZE; y += BLOCK_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_SIZE, y);
      ctx.stroke();
    }
    
    // Draw existing pixels from store
    drawPixelsFromStore(ctx);
    
    // Draw some sample pixels for better visualization
    const sampleColors = ['#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33'];
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * (CANVAS_SIZE / BLOCK_SIZE)) * BLOCK_SIZE;
      const y = Math.floor(Math.random() * (CANVAS_SIZE / BLOCK_SIZE)) * BLOCK_SIZE;
      ctx.fillStyle = sampleColors[i % sampleColors.length];
      ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
      
      // Add a border to make the pixel more visible
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    }
    
  }, []);
  
  // Update canvas when pixels change
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // Don't clear the entire canvas, just update the changed pixels
    drawPixelsFromStore(ctx);
    
    // Redraw selected blocks
    highlightSelectedBlocks(ctx);
    
  }, [pixels, selectedBlocks]);
  
  // Draw pixels from store
  const drawPixelsFromStore = (ctx: CanvasRenderingContext2D) => {
    // Draw all pixels from the store
    pixels.forEach((pixelData) => {
      // Make sure we have valid coordinates
      let x = pixelData.x;
      let y = pixelData.y;
      
      // If the coordinates are not in block format, convert them
      if (x % BLOCK_SIZE !== 0) {
        x = Math.floor(x / BLOCK_SIZE) * BLOCK_SIZE;
      }
      if (y % BLOCK_SIZE !== 0) {
        y = Math.floor(y / BLOCK_SIZE) * BLOCK_SIZE;
      }
      
      ctx.fillStyle = pixelData.color;
      ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
      
      // Add a border to make the pixel more visible
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    });
  };
  
  // Generate random color
  const getRandomColor = () => {
    const colors = [
      '#FF5733', '#33FF57', '#3357FF', '#FF33F5', 
      '#F5FF33', '#33FFF5', '#FF3333', '#33FF33', 
      '#3333FF', '#FFAA33', '#33FFAA', '#AA33FF'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Highlight selected blocks
  const highlightSelectedBlocks = (ctx: CanvasRenderingContext2D) => {
    // Draw a highlight around each selected block
    ctx.strokeStyle = '#0052FF';
    ctx.lineWidth = 2;
    
    selectedBlocks.forEach(block => {
      ctx.strokeRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
    });
  };
  
  // Toggle multi-select mode
  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedBlocks([]);
    setStatus(isMultiSelectMode ? 
      'Single select mode - Click on a pixel block to select it' : 
      'Multi-select mode - Click on multiple pixel blocks to select them');
    
    // Redraw canvas to clear highlights
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        drawPixelsFromStore(ctx);
      }
    }
  };
  
  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate the x and y coordinates of the click
    const x = Math.floor((e.clientX - rect.left) / BLOCK_SIZE) * BLOCK_SIZE;
    const y = Math.floor((e.clientY - rect.top) / BLOCK_SIZE) * BLOCK_SIZE;
    
    // Get the context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (isMultiSelectMode) {
      // Check if this block is already selected
      const blockIndex = selectedBlocks.findIndex(block => block.x === x && block.y === y);
      
      if (blockIndex >= 0) {
        // Remove from selection
        const newSelectedBlocks = [...selectedBlocks];
        newSelectedBlocks.splice(blockIndex, 1);
        setSelectedBlocks(newSelectedBlocks);
      } else {
        // Add to selection
        setSelectedBlocks([...selectedBlocks, { x, y }]);
      }
      
      // Redraw canvas
      drawPixelsFromStore(ctx);
      
      // Highlight selected blocks
      highlightSelectedBlocks(ctx);
      
      // Update status
      const totalPrice = pixelPrice ? pixelPrice * BigInt(selectedBlocks.length + (blockIndex >= 0 ? -1 : 1)) : BigInt(0);
      setStatus(`Selected ${selectedBlocks.length + (blockIndex >= 0 ? -1 : 1)} blocks. Total price: ${formatEth(totalPrice)} ETH`);
      
      // Call the onPixelsSelected callback if provided
      if (onPixelsSelected) {
        onPixelsSelected(blockIndex >= 0 ? 
          selectedBlocks.filter(block => block.x !== x || block.y !== y) : 
          [...selectedBlocks, { x, y }]);
      }
    } else {
      // Single select mode
      // Check if this block is already selected
      const isAlreadySelected = selectedBlocks.length === 1 && 
                               selectedBlocks[0].x === x && 
                               selectedBlocks[0].y === y;
      
      if (isAlreadySelected) {
        // Unselect the block
        setSelectedBlocks([]);
        
        // Redraw the canvas to clear any previous highlights
        drawPixelsFromStore(ctx);
        
        // Reset status
        setStatus('Ready - Click on a pixel block to select it');
        
        // Call the onPixelsSelected callback with empty array
        if (onPixelsSelected) {
          onPixelsSelected([]);
        }
      } else {
        // Select the block
        setSelectedBlocks([{ x, y }]);
        
        // Redraw the canvas to clear any previous highlights
        drawPixelsFromStore(ctx);
        
        // Draw a highlight around the selected block
        ctx.strokeStyle = '#0052FF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        
        // Check if this pixel is owned
        const pixelId = Math.floor(y / BLOCK_SIZE) * gridSize + Math.floor(x / BLOCK_SIZE);
        const pixelData = pixels.get(pixelId);
        
        // Update status
        if (pixelData && pixelData.owner !== '0x0000000000000000000000000000000000000000') {
          setStatus(`Block at (${x/BLOCK_SIZE}, ${y/BLOCK_SIZE}) is owned by ${formatAddress(pixelData.owner)}`);
        } else {
          setStatus(`Selected block at (${x/BLOCK_SIZE}, ${y/BLOCK_SIZE}). Price: ${pixelPrice ? formatEth(pixelPrice) : '0.01'} ETH`);
        }
        
        // Call the onPixelsSelected callback if provided
        if (onPixelsSelected) {
          onPixelsSelected([{ x, y }]);
        }
      }
    }
  };
  
  // Buy the selected pixel blocks
  const buySelectedBlocks = async () => {
    if (selectedBlocks.length === 0 || !isConnected) return;
    
    setStatus('Processing purchase...');
    
    try {
      // Calculate the pixelId for the selected block
      const block = selectedBlocks[0];
      const pixelId = Math.floor(block.y / BLOCK_SIZE) * (CANVAS_SIZE / BLOCK_SIZE) + Math.floor(block.x / BLOCK_SIZE);
      
      // Select the pixel in the store
      usePixelStore.getState().selectPixel(pixelId);
      
      if (selectedBlocks.length === 1) {
        // Call the claimSelectedPixel function from the store
        await claimSelectedPixel();
      } else {
        // Call the claimMultiplePixels function from the store
        await claimMultiplePixels(selectedBlocks.map(block => ({
          x: Math.floor(block.x / BLOCK_SIZE),
          y: Math.floor(block.y / BLOCK_SIZE)
        })));
      }
      
      // Update the canvas
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Draw the purchased pixels in a random color
      const color = getRandomColor();
      selectedBlocks.forEach(block => {
        ctx.fillStyle = color;
        ctx.fillRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
        
        // Add a border to make the pixel more visible
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
      });
      
      setStatus(`Successfully purchased ${selectedBlocks.length} block(s)!`);
      
      // Clear the selection
      setSelectedBlocks([]);
    } catch (error) {
      console.error('Error purchasing pixels:', error);
      setStatus(`Error purchasing pixels: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  return (
    <div className="pixel-canvas-wrapper">
      <div className="controls">
        <button 
          onClick={toggleMultiSelectMode}
          className={isMultiSelectMode ? "active-button" : ""}
        >
          {isMultiSelectMode ? "Single Select Mode" : "Select Multiple"}
        </button>
        
        {selectedBlocks.length > 0 && isConnected && (
          <button 
            onClick={buySelectedBlocks}
            className="buy-button"
          >
            Buy {selectedBlocks.length} Block{selectedBlocks.length > 1 ? 's' : ''} (${selectedBlocks.length * 10})
          </button>
        )}
      </div>
      
      <div id="status" className="status-message">{status}</div>
      
      <div className="pixel-container">
        <canvas 
          ref={canvasRef} 
          width={CANVAS_SIZE} 
          height={CANVAS_SIZE}
          onClick={handleCanvasClick}
          style={{ 
            imageRendering: 'pixelated',
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  );
};

export default PixelCanvas;
