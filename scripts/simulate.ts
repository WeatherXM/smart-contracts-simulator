import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { ethers } from 'hardhat';
import { mine, time } from '@nomicfoundation/hardhat-network-helpers';
import config from '../frontend/src/contracts/config.json';
import fs from 'fs';
async function main() {
  const [deployer] = await ethers.getSigners();
  const [
    owner,
    distributor,
    addr2,
    addr3,
    addr4,
    addr5,
    addr6,
    addr7,
    addr8,
    addr9
  ] = await ethers.getSigners();
  let rewards = [
    [await addr2.getAddress(), ethers.utils.parseEther(String(10.0))],
    [await addr3.getAddress(), ethers.utils.parseEther(String(60.0))],
    [await addr4.getAddress(), ethers.utils.parseEther(String(118.3))],
    [await addr5.getAddress(), ethers.utils.parseEther(String(30.0))],
    [await addr6.getAddress(), ethers.utils.parseEther(String(10.0))],
    [await addr7.getAddress(), ethers.utils.parseEther(String(10.0))],
    [await addr8.getAddress(), ethers.utils.parseEther(String(10.0))],
    [await addr9.getAddress(), ethers.utils.parseEther(String(10.0))]
  ];
  const tree = StandardMerkleTree.of(rewards, ['address', 'uint256']);
  interface Iproof {
    cumulativeAmount: {};
    proof: string[];
  }
  interface ProofRecord {
    [P: string]: Iproof;
  }

  var proofs: ProofRecord = {};
  for (const [i, v] of tree.entries()) {
    const proof = tree.getProof(i);
    let address = String(v[0]);
    proofs[address] = {
      cumulativeAmount: ethers.utils.formatUnits(String(v[1]), 'ether'),
      proof: proof
    };
  }
  const Token = await ethers.getContractFactory('WeatherXM');
  const token = await Token.attach(config.tokenAddress);

  const RewardPool = await ethers.getContractFactory('RewardPool');
  const rewardPool = await RewardPool.attach(config.rewardPoolAddress);
  await rewardPool
    .connect(owner)
    .grantRole(
      '0xfbd454f36a7e1a388bd6fc3ab10d434aa4578f811acbbcf33afb1c697486313c',
      await distributor.getAddress()
    );
  mine(2);
  await token.connect(owner).setMintTarget(config.rewardPoolAddress);
  await token.connect(distributor).mint();
  const dailyCumulativeRewards = ethers.utils.parseEther('10000');
  await rewardPool
    .connect(distributor)
    .submitMerkleRoot(tree.root, dailyCumulativeRewards);
  
  const txnGetRoot = await rewardPool.connect(distributor).roots(1);
  console.log('Submitted Root Hash: ' + txnGetRoot);
  console.log('Daily Total Cumulative Rewards: ' + dailyCumulativeRewards);
  fs.writeFileSync(
    __dirname + '/../frontend/src/contracts/tree.json',
    JSON.stringify(tree.dump()),
    'utf-8'
  );
  fs.writeFileSync(
    __dirname + '/../frontend/src/contracts/proofs.json',
    JSON.stringify(proofs),
    'utf-8'
  );
  await time.increase(90000);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
