import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './assets/app.css';
import PixelCanvas from './components/PixelCanvas';
import PixelDetails from './components/PixelDetails';
import NetworkStatus from './components/NetworkStatus';
import BaseLogo from './components/BaseLogo';
import Marketplace from './components/Marketplace';
import AboutUs from './components/AboutUs';
import ProfileDashboard from './components/ProfileDashboard';
import { usePixelStore } from './store/usePixelStore';
import { DEFAULT_CHAIN_ID } from './utils/config';

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// This will be our main App component
const App: React.FC = () => {
  const { 
    isConnected, 
    account, 
    provider,
    connectWallet, 
    disconnectWallet,
    error,
    isLoading
  } = usePixelStore();

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [disconnectWallet]);

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="container">
            <div className="header-left">
              <h1>
                <Link to="/">
                  <BaseLogo size={28} className="header-logo" />
                  Own This Pixel
                </Link>
              </h1>
            </div>
            
            <nav className="main-nav">
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/marketplace">Marketplace</Link></li>
                <li><Link to="/about">About Us</Link></li>
                {isConnected && <li><Link to="/profile">My Profile</Link></li>}
              </ul>
            </nav>
            
            <div className="wallet-connection">
              {!isConnected ? (
                <button onClick={connectWallet} disabled={isLoading}>
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              ) : (
                <div className="wallet-info">
                  <div className="account-info">
                    <span>Connected: {account?.slice(0, 6)}...{account?.slice(-4)}</span>
                    <button onClick={disconnectWallet} className="disconnect-button">Disconnect</button>
                  </div>
                  <NetworkStatus provider={provider} />
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main">
          <div className="container">
            {error && (
              <div className="global-error-message">
                {error}
              </div>
            )}
            
            <Routes>
              <Route path="/" element={<HomePage 
                isConnected={isConnected} 
                account={account} 
                provider={provider}
              />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/profile" element={<ProfileDashboard />} />
            </Routes>
          </div>
        </main>

        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-logo">
                <BaseLogo size={24} />
                <p>Own This Pixel</p>
              </div>
              
              <div className="footer-links">
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/marketplace">Marketplace</Link></li>
                  <li><Link to="/about">About Us</Link></li>
                </ul>
              </div>
              
              <div className="footer-social">
                <a href="https://twitter.com/ownthispixel" target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href="https://discord.gg/ownthispixel" target="_blank" rel="noopener noreferrer">Discord</a>
                <a href="https://github.com/ownthispixel" target="_blank" rel="noopener noreferrer">GitHub</a>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; 2025 Own This Pixel - A Web3 Pixel Canvas Platform on Base Chain</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

// Home page component
const HomePage: React.FC<{
  isConnected: boolean;
  account: string | null;
  provider: ethers.BrowserProvider | null;
}> = ({ isConnected, account, provider }) => {
  const [selectedPixels, setSelectedPixels] = useState<number[]>([]);

  // Handler for when pixels are selected in the canvas
  const handlePixelsSelected = (pixels: {x: number, y: number}[]) => {
    // Convert pixel coordinates to pixel IDs
    const pixelIds = pixels.map(p => Math.floor(p.x / 10) + Math.floor(p.y / 10) * 100);
    setSelectedPixels(pixelIds);
  };

  return (
    <div>
      <div className="container">
        <h1>Million Dollar Homepage Clone</h1>
        
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-value">1,000,000</div>
            <div className="stat-label">Total Pixels</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">10,000</div>
            <div className="stat-label">Blocks (10x10)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">$10</div>
            <div className="stat-label">Per Block</div>
          </div>
        </div>
        
        <div className="info-text">
          <p>Each pixel block is 10x10 pixels and costs $10 (paid in ETH). Click on a block to select it, then click "Buy Selected Block" to purchase.</p>
          {!isConnected && (
            <p className="connect-prompt">Connect your wallet to buy pixel blocks!</p>
          )}
        </div>
      </div>
      
      <div className="canvas-details-wrapper">
        <div style={{ display: 'flex', maxWidth: '1020px', margin: '0 auto', gap: '20px' }}>
          <div style={{ flex: '0 0 650px' }}>
            <PixelCanvas onPixelsSelected={handlePixelsSelected} />
          </div>
          <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '15px', borderRadius: '8px' }}>
            <PixelDetails 
              selectedPixels={selectedPixels} 
              onClear={() => setSelectedPixels([])} 
            />
          </div>
        </div>
      </div>
        
      <div className="container">
        <div className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Connect Wallet</h3>
              <p>Connect your MetaMask wallet to get started</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Select a Block</h3>
              <p>Click on any 10x10 pixel block on the canvas</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Purchase</h3>
              <p>Pay $10 in ETH to own that block forever</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Customize</h3>
              <p>Your block will be colored randomly, or you can set a custom color</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
