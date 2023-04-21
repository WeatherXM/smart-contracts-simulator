// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

interface IPriceFeedConsumer {
  /**
   * @dev Mutative function that enables aggregator instance change.
   */
  function setAggregatorInstance(address _aggregatorInstance) external;

  /**
   * @dev View function that returns latest price.
   */
  function getLatestPrice() external view returns (int256, uint);

  /**
   * @dev View function returns aggragator instance.
   */
  function getPriceFeed() external view returns (AggregatorV3Interface);
}
