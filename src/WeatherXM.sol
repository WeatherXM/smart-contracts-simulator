// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IWeatherXM } from "./interfaces/IWeatherXM.sol";
import { WeatherXMData } from "./WeatherXMData.sol";

contract WeatherXM is IWeatherXM, Pausable, ERC20, Ownable {
  /* ========== LIBRARIES ========== */
  using SafeMath for uint256;

  /* ========== STATE VARIABLES ========== */
  WeatherXMData internal data;
  uint256 private mintingLimit;
  address public mintTarget;
  uint256 public mintedCompanyTokens;
  uint256 public mintedRewardTokens;
  uint256 public cycle;

  /* ========== CONSTANTS ========== */
  uint256 public initialAmount = 18000000;
  uint256 public companyCap2y = 6000000 * 10 ** 18;
  uint256 public companyCap3y = 30000000 * 10 ** 18;
  uint256 public rewardCap = 52000000 * 10 ** 18;

  /* ========== CUSTOM ERRORS ========== */
  error TotalSupplyShouldNotSurpass100M();
  error TokenTransferWhilePaused();
  error MintingRateLimitingInEffect();
  error TargetAddressIsZero();
  error TargetAddressIsContractAddress();

  modifier validDestination(address _address) {
    if (_address == address(0x0)) {
      revert TargetAddressIsZero();
    }
    if (_address == address(this)) {
      revert TargetAddressIsContractAddress();
    }
    _;
  }

  /**
   * @notice Rate limit for minting.
   * @dev Every 24h is the minimum limit for minting tokens
   * @param period The period for which to enforce the rate limit
   * */
  modifier mintingRateLimit(uint256 period) {
    if (block.timestamp < mintingLimit) {
      revert MintingRateLimitingInEffect();
    }
    mintingLimit = mintingLimit.add(period);
    _;
  }

  constructor(string memory _name, string memory _symbol, address _address) ERC20(_name, _symbol) {
    mintingLimit = block.timestamp;
    data = WeatherXMData(_address);
    super._mint(_msgSender(), initialAmount * 10 ** uint256(decimals()));
  }

  function mint() public override mintingRateLimit(1440 minutes) whenNotPaused {
    if (totalSupply() >= 1e8 * 10 ** uint256(decimals())) {
      revert TotalSupplyShouldNotSurpass100M();
    }
    return _mintDaily();
  }

  function _mintDaily() internal {
    uint256 mintAmount;
    uint256 companyAmount;
    uint256 rewardAmount;
    if (mintedCompanyTokens < companyCap2y) {
      companyAmount = companyCap2y.sub(mintedCompanyTokens);
      if (companyAmount > 8200 * 10 ** 18) {
        companyAmount = 8200 * 10 ** 18;
      }
    } else if (mintedCompanyTokens < companyCap3y) {
      companyAmount = companyCap3y.sub(mintedCompanyTokens);
      if (companyAmount > 65753 * 10 ** 18) {
        companyAmount = 65753 * 10 ** 18;
      }
    }
    rewardAmount = rewardCap.sub(mintedRewardTokens);
    if (rewardAmount > 14246 * 10 ** 18) {
      rewardAmount = 14246 * 10 ** 18;
    }
    mintAmount = companyAmount.add(rewardAmount);
    if (mintAmount > 0 && mintAmount <= 1e8 * 10 ** uint256(decimals())) {
      mintedCompanyTokens = mintedCompanyTokens.add(companyAmount);
      mintedRewardTokens = mintedRewardTokens.add(rewardAmount);
      startCycle();
      data.updateDailyCompanyMints(cycle, companyAmount);
      data.updateDailyRewardMints(cycle, rewardAmount);
    }
    return super._mint(mintTarget, mintAmount);
  }

  function startCycle() internal {
    cycle = cycle.add(1);
    emit CycleBegan(cycle);
  }

  function getCycle() external view override returns (uint256) {
    return cycle;
  }

  function burn(uint256 amount) external override {
    super._burn(_msgSender(), amount);
  }

  function burnFrom(address account, uint256 amount) external override {
    super._spendAllowance(account, _msgSender(), amount);
    super._burn(account, amount);
  }

  function getMintedTokens() external view override returns (uint256, uint256) {
    return (mintedRewardTokens, mintedCompanyTokens);
  }

  function setMintTarget(address target) external override onlyOwner whenNotPaused validDestination(target) {
    mintTarget = target;
  }

  function pause() external override onlyOwner {
    super._pause();
  }

  function unpause() external override onlyOwner {
    super._unpause();
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
    super._beforeTokenTransfer(from, to, amount);
    if (paused()) {
      revert TokenTransferWhilePaused();
    }
  }
}
