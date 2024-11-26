
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ClickPointsContract {
    using SafeMath for uint256;

    mapping(address => uint256) private userPoints;
    uint256 private totalPoints;

    event PointsAdded(address indexed user, uint256 pointsAdded, uint256 newUserTotal);
    event TotalPointsUpdated(uint256 newTotalPoints);

    function addPoints(uint256 _points) external {
        require(_points > 0, "Points must be greater than zero");

        userPoints[msg.sender] = userPoints[msg.sender].add(_points);
        totalPoints = totalPoints.add(_points);

        emit PointsAdded(msg.sender, _points, userPoints[msg.sender]);
        emit TotalPointsUpdated(totalPoints);
    }

    function getUserPoints(address _user) external view returns (uint256) {
        return userPoints[_user];
    }

    function getTotalPoints() external view returns (uint256) {
        return totalPoints;
    }
}
