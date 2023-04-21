// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import { AccessControlEnumerableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import { WeatherXMData } from "./WeatherXMData.sol";
import { IWeatherXM } from "./interfaces/IWeatherXM.sol";
import { IRewardPool } from "./interfaces/IRewardPool.sol";

/**
 * @title RewardPool contract.
 *
 * @notice This constract serves as a rewards allocation pool.
 *
 * */

contract RewardPool is
  Initializable,
  UUPSUpgradeable,
  ReentrancyGuardUpgradeable,
  AccessControlEnumerableUpgradeable,
  IRewardPool,
  PausableUpgradeable
{
  /* ========== LIBRARIES ========== */
  using SafeMath for uint256;
  using MerkleProof for bytes32[];

  /* ========== STATE VARIABLES ========== */
  IWeatherXM public token;
  WeatherXMData public data;
  mapping(address => uint256) public claims;
  mapping(uint256 => bytes32) public roots;

  uint256 private rewardsEnabled;
  uint256 private companyEnabled;
  uint256 public totalAllocatedRewards;
  uint256 public claimedRewards;
  uint256 public companyWithdrawals;
  address public companyTokensTarget;
  address public businessDevTokensTarget;
  uint256 public latestBusinessDevWithdrawal;
  mapping(uint256 => uint256) public businessDevAllocatedTokens;
  mapping(uint256 => uint256) public dailyAllocatedRewards;
  uint256 public latestCompanyWithdrawal;

  /* ========== ROLES ========== */
  bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
  bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

  /**
   * @notice Rate limit for submitting root hashes.
   * @dev Every 24h is the minimum limit for submitting root hashes for rewards
   * due to the fact that every 24h, the minting is going to take place for the first 10ys
   * @param period The period for which to enforce the rate limit
   * */
  modifier rateLimit(uint256 period) {
    if (block.timestamp < rewardsEnabled) {
      revert RewardsRateLimitingInEffect();
    }
    rewardsEnabled = rewardsEnabled.add(period);
    _;
  }

  /**
   * @notice Check target address for token transfer or withdrawal.
   * @dev Prevent the transfer of tokens to the same address of the smart contract
   * @param to The target address
   * */
  modifier validDestination(address to) {
    if (to == address(0x0)) {
      revert TargetAddressIsZero();
    }
    if (to == address(this)) {
      revert TargetAddressIsContractAddress();
    }
    _;
  }

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(address _token, address _data) public initializer {
    __UUPSUpgradeable_init();
    __AccessControlEnumerable_init();
    __Pausable_init();
    __ReentrancyGuard_init();

    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    _setupRole(UPGRADER_ROLE, _msgSender());
    token = IWeatherXM(_token);
    data = WeatherXMData(_data);
    rewardsEnabled = block.timestamp;
    companyEnabled = block.timestamp;
  }

  /**
   * @notice Submit root hash for rewards.
   * @dev The root hash is calculated of chain and submitted every day.
   * The root hash is stored also off chain in order to calculate each
   * recipient's daily proof if requested for withdrawal.
   * The root hashes are stored in a mapping where the cycle is the accessor.
   * For every cycle there is only one root hash.
   * @param root The root hash containing the cumulative rewards plus the daily rewards.
   * */
  function submitMerkleRoot(
    bytes32 root,
    uint256 dailyCumulativeRewards
  ) external override onlyRole(DISTRIBUTOR_ROLE) rateLimit(1440 minutes) whenNotPaused returns (bool) {
    if (totalAllocatedRewards.add(dailyCumulativeRewards).sub(claimedRewards) > token.balanceOf(address(this))) {
      revert NotEnoughRewards();
    }
    uint256 activeCycle = token.getCycle();
    roots[activeCycle] = root;
    dailyAllocatedRewards[activeCycle] = dailyCumulativeRewards;
    totalAllocatedRewards = totalAllocatedRewards.add(dailyCumulativeRewards);
    businessDevAllocatedTokens[activeCycle] = data.dailyRewardMint(activeCycle).sub(dailyCumulativeRewards);
    emit SubmittedRootHash(token.getCycle(), root);
    return true;
  }

  /**
   * @notice Get remaining rewards to claim.
   * @param account The account of the recipient
   * @param amount The cumulative amount of rewards up to the selected cycle
   * @param cycle cycle for which to choose the root hash
   * @param proof The recipient's proof
   * */
  function getRemainingAllocatedRewards(
    address account,
    uint256 amount,
    uint256 cycle,
    bytes32[] calldata proof
  ) external view override whenNotPaused returns (uint256) {
    if (_msgSender() == address(this)) {
      revert CallerShouldNotBeThisContract();
    }
    return allocatedRewardsForProofMinusRewarded(account, amount, cycle, proof);
  }

  /**
   * @notice Get available balance of rewards.
   * @dev Calculate available rewards to claim by substracting from cumultaive rewards the already claim.
   * @param account The account of the recipient
   * @param amount The cumulative amount of rewards up to the selected cycle
   * @param cycle cycle for which to choose the root hash
   * @param proof The recipient's proof
   * */
  function allocatedRewardsForProofMinusRewarded(
    address account,
    uint256 amount,
    uint256 cycle,
    bytes32[] calldata proof
  ) internal view returns (uint256) {
    if (amount == 0) {
      revert AmountRequestedIsZero();
    }
    uint256 total = verify(account, amount, cycle, proof);
    if (claims[account] < total) {
      return total.sub(claims[account]);
    } else {
      return 0;
    }
  }

  /**
   * @notice Transfer rewards to a recipient.
   * @dev Receives the amount and proof for a specific recipient defined by the address and transfers the rewards.
   * The amount should be lower or equal to the available rewards to transfer.
   * @param to The recipient's address
   * @param amount The amount to transfer (in WEI)
   * @param totalRewards The cumulative amount of rewards up to the point of the requested cycle
   * @param cycle The desired cycle for which to choose the root hash
   * @param proof The _proof that enables the claim of the requested amount of tokens
   * */
  function transferRewards(
    address to,
    uint256 amount,
    uint256 totalRewards,
    uint256 cycle,
    bytes32[] calldata proof
  ) external override onlyRole(DISTRIBUTOR_ROLE) whenNotPaused nonReentrant validDestination(to) returns (bool) {
    if (totalRewards == 0) {
      revert TotalRewardsAreZero();
    }
    if (amount == 0) {
      revert AmountRequestedIsZero();
    }
    if (token.balanceOf(address(this)) < amount) {
      revert BalanceIsNotEnough();
    }
    if (amount > allocatedRewardsForProofMinusRewarded(to, totalRewards, cycle, proof)) {
      revert AmountIsOverAvailableRewardsToWithdraw();
    }
    claims[to] = claims[to].add(amount);
    claimedRewards = claimedRewards.add(amount);
    if (!token.transfer(to, amount)) {
      revert TransferFailed();
    }
    return true;
  }

  /**
   * @notice Transfer tokens for vesting to a company pool.
   * */
  function transferCompanyTokens() external override onlyRole(DISTRIBUTOR_ROLE) whenNotPaused nonReentrant {
    uint256 guard = token.getCycle();
    if (latestCompanyWithdrawal > guard) {
      revert ZeroTokensToTransfer();
    }
    uint256 sum;
    uint256 i;
    for (i = latestCompanyWithdrawal; i <= guard; ) {
      sum = sum.add(data.dailyCompanyMint(i));
      unchecked {
        i++;
      }
    }
    latestCompanyWithdrawal = i;
    companyWithdrawals = companyWithdrawals.add(sum);
    if (!token.transfer(companyTokensTarget, sum) || sum == 0) {
      revert TransferFailed();
    }
    emit CompanyTokensTransferred(companyTokensTarget, sum);
  }

  /**
   * @notice Transfer remaining tokens from daily rewarding to business development pool.
   * */
  function transferBusinessDevTokens() external override onlyRole(DISTRIBUTOR_ROLE) whenNotPaused nonReentrant {
    uint256 guard = token.getCycle();
    if (latestBusinessDevWithdrawal > guard) {
      revert ZeroTokensToTransfer();
    }
    uint256 sum;
    uint256 i;
    for (i = latestBusinessDevWithdrawal; i <= guard; ) {
      sum = sum.add(businessDevAllocatedTokens[i]);
      unchecked {
        i++;
      }
    }
    latestBusinessDevWithdrawal = i;
    if (!token.transfer(businessDevTokensTarget, sum) || sum == 0) {
      revert TransferFailed();
    }
    emit BusinessDevTokensTransferred(businessDevTokensTarget, sum);
  }

  /**
   * @notice Setup target address for receiving company and investors tokens.
   * */
  function setCompanyTarget(address target) external override onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
    companyTokensTarget = target;
  }

  /**
   * @notice Setup target address for receiving business development tokens.
   * */
  function setBusinessDevTarget(address target) external override onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
    businessDevTokensTarget = target;
  }

  /**
   * @notice Verify proof for the chosen root hash.
   * @param account The account of the recipient
   * @param amount The cumulative amount of tokens
   * @param cycle The desired cycle for which to choose the root hash
   * @param proof The _proof that enables the claim of the requested amount of tokens
   * */
  function verify(
    address account,
    uint256 amount,
    uint256 cycle,
    bytes32[] calldata proof
  ) internal view returns (uint256) {
    bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(account, amount))));
    require(MerkleProof.verify(proof, roots[cycle], leaf), "INVALID PROOF");
    return amount;
  }

  /**
   * @notice Claim rewards.
   * @dev Anyone can claim own rewards by submitting the amount and a proof.
   * The amount should be lower or equal to the available allocated to withdraw.
   * @param amount The amount of tokens to claim
   * @param totalRewards The cumulative amount of rewards up to the point of the requested cycle
   * @param cycle The desired cycle for which to choose the root hash
   * @param proof The _proof that enables the claim of the requested amount of tokens
   * */
  function claim(
    uint256 amount,
    uint256 totalRewards,
    uint256 cycle,
    bytes32[] calldata proof
  ) external override whenNotPaused nonReentrant {
    if (totalRewards == 0) {
      revert TotalRewardsAreZero();
    }
    if (amount == 0) {
      revert AmountRequestedIsZero();
    }
    if (token.balanceOf(address(this)) < amount) {
      revert BalanceIsNotEnough();
    }
    //have to pass the cycle otherwise the latest cycle should be used
    //in that case, a different cycle should be used for merkle trees
    //uint256 total = verify(_msgSender(),totalRewards, cycle, proof);
    if (amount > allocatedRewardsForProofMinusRewarded(_msgSender(), totalRewards, cycle, proof)) {
      revert AmountIsOverAvailableRewardsToWithdraw();
    }
    claims[_msgSender()] = claims[_msgSender()].add(amount);
    claimedRewards = claimedRewards.add(amount);
    if (!token.transfer(_msgSender(), amount)) {
      revert TransferFailed();
    }
    emit Claimed(_msgSender(), amount);
  }

  function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
    super._pause();
  }

  function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
    super._unpause();
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
}
