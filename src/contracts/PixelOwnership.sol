// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title PixelOwnership
 * @dev ERC1155 contract for owning pixels on a 1000x1000 grid
 */
contract PixelOwnership is ERC1155, Ownable, ReentrancyGuard {
    using Strings for uint256;
    
    // Constants
    uint256 public constant GRID_SIZE = 1000;
    uint256 public constant TOTAL_PIXELS = GRID_SIZE * GRID_SIZE;
    uint256 public constant PIXEL_PRICE = 0.01 ether;
    
    // Mapping from pixel ID to owner address
    mapping(uint256 => address) public pixelOwners;
    
    // Mapping from pixel ID to color (stored as a hex string)
    mapping(uint256 => string) public pixelColors;
    
    // Events
    event PixelClaimed(address indexed owner, uint256 indexed pixelId, uint256 x, uint256 y);
    event PixelColorChanged(uint256 indexed pixelId, string newColor);
    event PixelTransferred(address indexed from, address indexed to, uint256 indexed pixelId);
    
    constructor() ERC1155("https://api.ownthispixel.com/metadata/{id}") {
        // Initialize contract
    }
    
    /**
     * @dev Convert x,y coordinates to a pixel ID
     * @param x X coordinate (0-999)
     * @param y Y coordinate (0-999)
     * @return Pixel ID
     */
    function _toPixelId(uint256 x, uint256 y) internal pure returns (uint256) {
        require(x < GRID_SIZE && y < GRID_SIZE, "Coordinates out of bounds");
        return y * GRID_SIZE + x;
    }
    
    /**
     * @dev Convert pixel ID to x,y coordinates
     * @param pixelId Pixel ID
     * @return x X coordinate
     * @return y Y coordinate
     */
    function _toCoordinates(uint256 pixelId) internal pure returns (uint256 x, uint256 y) {
        require(pixelId < TOTAL_PIXELS, "Pixel ID out of bounds");
        y = pixelId / GRID_SIZE;
        x = pixelId % GRID_SIZE;
    }
    
    /**
     * @dev Claim ownership of a pixel
     * @param x X coordinate (0-999)
     * @param y Y coordinate (0-999)
     */
    function claimPixel(uint256 x, uint256 y) external payable nonReentrant {
        uint256 pixelId = _toPixelId(x, y);
        
        require(pixelOwners[pixelId] == address(0), "Pixel already owned");
        require(msg.value >= PIXEL_PRICE, "Insufficient payment");
        
        pixelOwners[pixelId] = msg.sender;
        pixelColors[pixelId] = "#FFFFFF"; // Default to white
        
        _mint(msg.sender, pixelId, 1, "");
        
        emit PixelClaimed(msg.sender, pixelId, x, y);
        
        // Refund excess payment
        if (msg.value > PIXEL_PRICE) {
            payable(msg.sender).transfer(msg.value - PIXEL_PRICE);
        }
    }
    
    /**
     * @dev Change the color of a pixel
     * @param pixelId Pixel ID
     * @param newColor New color (hex string)
     */
    function changePixelColor(uint256 pixelId, string calldata newColor) external {
        require(pixelOwners[pixelId] == msg.sender, "Not the pixel owner");
        
        pixelColors[pixelId] = newColor;
        
        emit PixelColorChanged(pixelId, newColor);
    }
    
    /**
     * @dev Get pixel information
     * @param pixelId Pixel ID
     * @return owner Owner address
     * @return color Color (hex string)
     */
    function getPixelInfo(uint256 pixelId) external view returns (address owner, string memory color) {
        require(pixelId < TOTAL_PIXELS, "Pixel ID out of bounds");
        
        owner = pixelOwners[pixelId];
        color = pixelColors[pixelId];
    }
    
    /**
     * @dev Override ERC1155 transfer to update pixelOwners mapping
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        super.safeTransferFrom(from, to, id, amount, data);
        
        // Update pixel owner
        if (amount > 0 && id < TOTAL_PIXELS) {
            pixelOwners[id] = to;
            emit PixelTransferred(from, to, id);
        }
    }
    
    /**
     * @dev Override ERC1155 batch transfer to update pixelOwners mapping
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override {
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
        
        // Update pixel owners
        for (uint256 i = 0; i < ids.length; i++) {
            if (amounts[i] > 0 && ids[i] < TOTAL_PIXELS) {
                pixelOwners[ids[i]] = to;
                emit PixelTransferred(from, to, ids[i]);
            }
        }
    }
    
    /**
     * @dev Withdraw contract balance to owner
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Override URI to provide metadata for each pixel
     */
    function uri(uint256 pixelId) public view override returns (string memory) {
        require(pixelId < TOTAL_PIXELS, "Pixel ID out of bounds");
        
        (uint256 x, uint256 y) = _toCoordinates(pixelId);
        
        return string(
            abi.encodePacked(
                "https://api.ownthispixel.com/metadata/",
                pixelId.toString(),
                "?x=",
                x.toString(),
                "&y=",
                y.toString(),
                "&color=",
                pixelColors[pixelId]
            )
        );
    }
}
