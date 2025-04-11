# Own This Pixel

A Web3 Pixel Canvas Platform built on Base Chain where users can own and customize pixels as NFTs.

![Own This Pixel](https://i.imgur.com/placeholder.png)

## Overview

Own This Pixel is a decentralized application (dApp) that allows users to:

- Claim ownership of pixels on a 1000x1000 grid as ERC-1155 tokens
- Customize the colors of owned pixels
- Trade pixels with other users
- Create digital art on the blockchain

The application is built on Base Chain, an Ethereum L2 scaling solution.

## Features

- **Pixel Ownership**: Each pixel on the 1000x1000 grid can be owned as an ERC-1155 token
- **Color Customization**: Owners can change the color of their pixels
- **Interactive Canvas**: Zoom, pan, and navigate the pixel grid
- **Wallet Integration**: Connect with MetaMask and other Web3 wallets
- **Base Chain Integration**: Built on Base Chain for lower gas fees and faster transactions

## Technology Stack

- **Frontend**: React, TypeScript, PixiJS
- **State Management**: Zustand
- **Blockchain Interaction**: ethers.js
- **Smart Contracts**: Solidity (ERC-1155)
- **Build Tools**: Webpack, Babel
- **Styling**: CSS

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MetaMask or another Web3 wallet

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ownthispixel.git
   cd ownthispixel
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Connecting to Base Chain

The application will automatically prompt you to connect to Base Chain if you're on a different network. You can also manually add Base Chain to your MetaMask:

- **Network Name**: Base Mainnet
- **RPC URL**: https://mainnet.base.org
- **Chain ID**: 8453
- **Currency Symbol**: ETH
- **Block Explorer URL**: https://basescan.org

## Smart Contract

The PixelOwnership smart contract is an ERC-1155 implementation that allows users to:

- Claim ownership of pixels for 0.01 ETH
- Change the color of owned pixels
- Transfer ownership of pixels

The contract is deployed on Base Chain at: `0x0000000000000000000000000000000000000000` (placeholder)

## Development

### Available Scripts

- `npm start` - Starts the development server with hot reloading
- `npm run build` - Builds the app for production
- `npm run dev` - Starts the development server in development mode

### Project Structure

```
ownthispixel/
├── public/               # Static files
├── src/                  # Source code
│   ├── assets/           # CSS and other assets
│   ├── components/       # React components
│   ├── contracts/        # Contract interfaces
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand store
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main App component
│   └── index.tsx         # Entry point
├── .babelrc              # Babel configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── webpack.config.js     # Webpack configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Base Chain](https://base.org) - For providing a scalable L2 solution
- [OpenZeppelin](https://openzeppelin.com) - For secure smart contract libraries
- [PixiJS](https://pixijs.com) - For the interactive canvas rendering
