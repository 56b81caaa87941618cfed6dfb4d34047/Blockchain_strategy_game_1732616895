
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ClickPointsContract is Ownable {
    mapping(address => uint256) private userPoints;
    address public authorizedFrontend;

    event PointsAdded(address indexed user, uint256 newTotal);

    constructor() Ownable() {
        authorizedFrontend = msg.sender; // Initially set to contract deployer
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner() || msg.sender == authorizedFrontend, "Not authorized");
        _;
    }

    function setAuthorizedFrontend(address _newFrontend) external onlyOwner {
        require(_newFrontend != address(0), "Invalid address");
        authorizedFrontend = _newFrontend;
    }

    function addPoint(address user) external onlyAuthorized {
        userPoints[user] += 1;
        emit PointsAdded(user, userPoints[user]);
    }

    function getPoints(address user) external view returns (uint256) {
        return userPoints[user];
    }
}
