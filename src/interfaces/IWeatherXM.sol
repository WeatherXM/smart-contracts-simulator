// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

interface IWeatherXM is IERC20Metadata {
  /**
   * @dev Emitted when a cycle is initiated with every mint
   * This event contains the new cycle
   */
  event CycleBegan(uint256 cycle);

  //ERC20 operations
  function mint() external;

  function setMintTarget(address target) external;

  function burnFrom(address account, uint256 amount) external;

  function burn(uint256 amount) external;

  function getMintedTokens() external view returns (uint256, uint256);

  function getCycle() external returns (uint256);

  function pause() external;

  function unpause() external;
}
