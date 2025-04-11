import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { usePixelStore } from '../store/usePixelStore';
import { formatAddress, formatEth } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

interface ProfileStats {
  pixelsOwned: number;
  activeListings: number;
  totalSales: bigint;
  royaltiesEarned: bigint;
  accountAge: number; // days since first pixel claimed
  achievements: number;
  ensName: string | null;
}

interface Transaction {
  txHash: string;
  type: 'MINT' | 'TRANSFER' | 'SALE';
  pixelId: number;
  value: string;
  timestamp: number;
  link: string;
}

const ProfileDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    account, 
    isConnected, 
    provider,
    pixels,
    error,
    setError
  } = usePixelStore();
  
  const [stats, setStats] = useState<ProfileStats>({
    pixelsOwned: 0,
    activeListings: 0,
    totalSales: BigInt(0),
    royaltiesEarned: BigInt(0),
    accountAge: 0,
    achievements: 0,
    ensName: null
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioViewMode, setPortfolioViewMode] = useState<'Grid Heatmap' | 'Color Distribution' | 'Acquisition Timeline'>('Grid Heatmap');
  const [ownedPixels, setOwnedPixels] = useState<{id: number, color: string, x: number, y: number}[]>([]);
  
  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!isConnected || !account || !provider) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // In a real implementation, this would fetch data from the contract and BaseScan API
        // For now, we'll use mock data
        
        // Simulate fetching ENS name
        let ensName = null;
        if (Math.random() > 0.5) {
          ensName = "pixelmaster.eth";
        }
        
        // Calculate account age (days since first pixel claimed)
        const firstClaimDate = new Date(Date.now() - Math.random() * 31536000000);
        const accountAge = Math.floor((Date.now() - firstClaimDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const mockStats: ProfileStats = {
          pixelsOwned: Math.floor(Math.random() * 100) + 1,
          activeListings: Math.floor(Math.random() * 10),
          totalSales: BigInt(Math.floor(Math.random() * 1000000000000000)),
          royaltiesEarned: BigInt(Math.floor(Math.random() * 100000000000000)),
          accountAge: accountAge,
          achievements: Math.floor(Math.random() * 8),
          ensName: ensName
        };
        
        // Mock transactions
        const mockTransactions: Transaction[] = Array.from({ length: 10 }, (_, i) => ({
          txHash: `0x${Math.random().toString(16).substring(2, 42)}`,
          type: ['MINT', 'TRANSFER', 'SALE'][Math.floor(Math.random() * 3)] as 'MINT' | 'TRANSFER' | 'SALE',
          pixelId: Math.floor(Math.random() * 1000000),
          value: (Math.random() * 0.1).toFixed(4),
          timestamp: Date.now() - Math.random() * 2592000000,
          link: `https://basescan.org/tx/0x${Math.random().toString(16).substring(2, 42)}`
        }));
        
        // Sort transactions by timestamp (newest first)
        mockTransactions.sort((a, b) => b.timestamp - a.timestamp);
        
        // Mock owned pixels
        const mockOwnedPixels = Array.from({ length: mockStats.pixelsOwned }, (_, i) => ({
          id: i,
          color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
          x: Math.floor(Math.random() * 1000),
          y: Math.floor(Math.random() * 1000)
        }));
        
        setStats(mockStats);
        setTransactions(mockTransactions);
        setOwnedPixels(mockOwnedPixels);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch user stats');
        setIsLoading(false);
      }
    };
    
    fetchUserStats();
  }, [isConnected, account, provider, setError]);
  
  // Check if user has a specific achievement
  const hasBadge = (flag: number) => {
    return (stats.achievements & flag) !== 0;
  };
  
  // Export portfolio data
  const exportPortfolio = () => {
    const data = {
      snapshot: Date.now(),
      pixels: ownedPixels.map(p => ({
        id: p.id,
        color: p.color,
        x: p.x,
        y: p.y
      }))
    };
    
    // Create a downloadable file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel-portfolio-${account?.slice(0, 6)}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Render achievement badge
  const renderAchievementBadge = (flag: number, title: string, description: string, icon: string) => {
    const isUnlocked = hasBadge(flag);
    
    return (
      <div className={`achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}`}>
        <div className="badge-icon">
          {icon}
        </div>
        <div className="badge-info">
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
        {isUnlocked && <div className="badge-unlocked">✓</div>}
      </div>
    );
  };
  
  // If not connected, show connect prompt
  if (!isConnected) {
    return (
      <div className="profile-dashboard card empty-state">
        <h3>Your Pixel Empire</h3>
        <p>🖼️ Your pixel empire starts here! Connect your wallet to view your profile stats.</p>
        <button onClick={() => navigate('/')}>Connect Wallet</button>
      </div>
    );
  }
  
  return (
    <div className="profile-dashboard">
      {/* Header Section */}
      <div className="profile-header card">
        <div className="avatar">
          {/* Simple avatar based on address */}
          <div 
            className="avatar-image"
            style={{ 
              backgroundColor: `#${account?.slice(2, 8) || '000000'}`,
              color: '#fff',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {account?.slice(0, 2)}
          </div>
        </div>
        
        <div className="profile-info">
          <h3>{stats.ensName || formatAddress(account || '')}</h3>
          {stats.ensName && <p className="wallet-address">{formatAddress(account || '')}</p>}
          <div className="base-badge">Base Network</div>
          <p>Account Age: {stats.accountAge} days</p>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="stat-card card">
          <div className="stat-icon">🖼️</div>
          <div className="stat-info">
            <h4>Pixels Owned</h4>
            <div className="stat-value">{stats.pixelsOwned}</div>
          </div>
        </div>
        
        <div className="stat-card card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <h4>Active Listings</h4>
            <div className="stat-value">{stats.activeListings}</div>
          </div>
        </div>
        
        <div className="stat-card card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h4>Total Sales</h4>
            <div className="stat-value">{formatEth(stats.totalSales)} ETH</div>
          </div>
        </div>
        
        <div className="stat-card card">
          <div className="stat-icon">💎</div>
          <div className="stat-info">
            <h4>Royalties Earned</h4>
            <div className="stat-value">{formatEth(stats.royaltiesEarned)} ETH</div>
          </div>
        </div>
      </div>
      
      {/* Portfolio Visualizer */}
      <div className="portfolio-section card">
        <div className="section-header">
          <h3>Pixel Portfolio</h3>
          <div className="view-mode-selector">
            {(['Grid Heatmap', 'Color Distribution', 'Acquisition Timeline'] as const).map(mode => (
              <button 
                key={mode}
                className={portfolioViewMode === mode ? 'active' : ''}
                onClick={() => setPortfolioViewMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        
        <div className="portfolio-visualizer">
          {isLoading ? (
            <div className="loading">Loading portfolio data...</div>
          ) : ownedPixels.length === 0 ? (
            <div className="empty-portfolio">
              <p>You don't own any pixels yet. Visit the marketplace to get started!</p>
              <button onClick={() => navigate('/marketplace')}>Go to Marketplace</button>
            </div>
          ) : (
            <div className="portfolio-map">
              {/* Simple grid representation of owned pixels */}
              <div className="pixel-grid-preview">
                {portfolioViewMode === 'Grid Heatmap' && (
                  <div className="heatmap">
                    {Array.from({ length: 10 }).map((_, y) => (
                      <div key={`row-${y}`} className="heatmap-row">
                        {Array.from({ length: 10 }).map((_, x) => {
                          // Check if user owns any pixels in this region
                          const pixelsInRegion = ownedPixels.filter(p => 
                            Math.floor(p.x / 100) === x && Math.floor(p.y / 100) === y
                          );
                          
                          const opacity = pixelsInRegion.length > 0 
                            ? Math.min(1, pixelsInRegion.length / 10) 
                            : 0;
                          
                          return (
                            <div 
                              key={`cell-${x}-${y}`} 
                              className="heatmap-cell"
                              style={{ 
                                backgroundColor: `rgba(0, 82, 255, ${opacity})`,
                                border: pixelsInRegion.length > 0 ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
                              }}
                              title={`Region (${x*100}-${(x+1)*100}, ${y*100}-${(y+1)*100}): ${pixelsInRegion.length} pixels`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
                
                {portfolioViewMode === 'Color Distribution' && (
                  <div className="color-distribution">
                    <div className="color-palette">
                      {/* Group pixels by similar colors and show distribution */}
                      {Array.from(new Set(ownedPixels.map(p => p.color.substring(0, 4) + '0'))).map(colorGroup => {
                        const pixelsWithColor = ownedPixels.filter(p => p.color.startsWith(colorGroup.substring(0, 4)));
                        const percentage = (pixelsWithColor.length / ownedPixels.length) * 100;
                        
                        return (
                          <div key={colorGroup} className="color-group">
                            <div 
                              className="color-sample" 
                              style={{ backgroundColor: colorGroup + '0' }}
                            />
                            <div className="color-percentage">{percentage.toFixed(1)}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {portfolioViewMode === 'Acquisition Timeline' && (
                  <div className="acquisition-timeline">
                    <div className="timeline-chart">
                      {/* Simple representation of acquisition over time */}
                      <div className="timeline-bars">
                        {Array.from({ length: 12 }).map((_, i) => {
                          const height = Math.random() * 80 + 20;
                          return (
                            <div 
                              key={`month-${i}`} 
                              className="timeline-bar"
                              style={{ height: `${height}%` }}
                              title={`Month ${i+1}: ${Math.floor(height / 100 * ownedPixels.length)} pixels`}
                            />
                          );
                        })}
                      </div>
                      <div className="timeline-labels">
                        <span>Jan</span>
                        <span>Dec</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="portfolio-actions">
          <button onClick={exportPortfolio} disabled={ownedPixels.length === 0}>
            Export Portfolio
          </button>
          <button onClick={() => navigate('/marketplace')}>
            Expand Your Collection
          </button>
        </div>
      </div>
      
      {/* Achievements */}
      <div className="achievements-section card">
        <h3>Achievements</h3>
        
        <div className="achievements-grid">
          {renderAchievementBadge(0x1, 'First Pixel', 'Claim your first pixel', '🏆')}
          {renderAchievementBadge(0x2, '100 Club', 'Own 100+ pixels', '💯')}
          {renderAchievementBadge(0x4, 'Color Master', 'Change colors on 50+ pixels', '🎨')}
          {renderAchievementBadge(0x8, 'Art Collector', 'Own pixels in all regions', '🖼️')}
          {renderAchievementBadge(0x10, 'Pixel Trader', 'Complete 10+ marketplace transactions', '💰')}
          {renderAchievementBadge(0x20, 'Early Adopter', 'Join during platform launch', '🚀')}
        </div>
      </div>
      
      {/* Transaction History */}
      <div className="transactions-section card">
        <h3>Transaction History</h3>
        
        {transactions.length === 0 ? (
          <div className="empty-transactions">
            <p>No transactions yet. Start building your pixel empire!</p>
          </div>
        ) : (
          <div className="transaction-list">
            {transactions.map(tx => (
              <div key={tx.txHash} className="transaction-card" onClick={() => window.open(tx.link)}>
                <div className={`transaction-type ${tx.type.toLowerCase()}`}>
                  {tx.type === 'MINT' && '🔨'}
                  {tx.type === 'TRANSFER' && '↔️'}
                  {tx.type === 'SALE' && '💰'}
                  {tx.type}
                </div>
                <div className="transaction-details">
                  <div className="transaction-pixel">Pixel #{tx.pixelId}</div>
                  <div className="transaction-time">{new Date(tx.timestamp).toLocaleString()}</div>
                </div>
                {tx.type === 'SALE' && (
                  <div className="transaction-value">{tx.value} ETH</div>
                )}
                <div className="transaction-link">→</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDashboard;
