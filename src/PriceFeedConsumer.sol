// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import { IPriceFeedConsumer } from "./interfaces/IPriceFeedConsumer.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title The PriceFeedConsumer contract
 * @notice A contract that returns latest price from Chainlink Price Feeds
 * @dev The pair for which the price is returned, is selected by the contracts address which is used in constructor
 * The Admin can change the pair, by setting a new aggregator instance
 */
contract PriceFeedConsumer is IPriceFeedConsumer, AccessControl {
  AggregatorV3Interface internal priceFeed;

  constructor(address _priceFeed) {
    super._setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    //_priceFeed = the mumbai MATIC/USD pair contract address of AggregatorV3Instance (this should be replaced with WXM pair)
    priceFeed = AggregatorV3Interface(_priceFeed);
  }

  /**
   * @notice Returns the latest price
   *
   * @return latest price
   */
  function getLatestPrice() external view override returns (int256, uint) {
    (, int256 price, , uint timeStamp, ) = priceFeed.latestRoundData();
    return (price, timeStamp);
  }

  /**
   * @notice Change contract address to track for pricefeed.
   *
   * @param _aggregatorInstance The contract address for the WXM price pair to track
   * */
  function setAggregatorInstance(address _aggregatorInstance) external override onlyRole(DEFAULT_ADMIN_ROLE) {
    priceFeed = AggregatorV3Interface(_aggregatorInstance);
  }

  /**
   * @notice Returns the Price Feed address
   *
   * @return Price Feed address
   */
  function getPriceFeed() external view override returns (AggregatorV3Interface) {
    return priceFeed;
  }
}
