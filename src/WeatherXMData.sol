// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract WeatherXMData is Initializable, UUPSUpgradeable, OwnableUpgradeable {
  using SafeMath for uint256;

  mapping(uint256 => uint256) public dailyCompanyMint;
  mapping(uint256 => uint256) public dailyRewardMint;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize() public initializer {
    __UUPSUpgradeable_init();
    __Ownable_init();
  }

  function updateDailyCompanyMints(uint256 _cycle, uint256 _amount) public {
    dailyCompanyMint[_cycle] = _amount;
  }

  function updateDailyRewardMints(uint256 _cycle, uint256 _amount) public {
    dailyRewardMint[_cycle] = _amount;
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
