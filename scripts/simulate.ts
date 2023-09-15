import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { ethers } from 'hardhat';
import { mine, time } from '@nomicfoundation/hardhat-network-helpers';
import config from '../frontend/src/contracts/config.json';
import fs from 'fs';

async function simulate() {
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
    [await addr4.getAddress(), ethers.utils.parseEther(String(48.3))],
    [await addr5.getAddress(), ethers.utils.parseEther(String(30.0))],
    [await addr6.getAddress(), ethers.utils.parseEther(String(10.0))],
    [await addr7.getAddress(), ethers.utils.parseEther(String(10.0))],
    [await addr8.getAddress(), ethers.utils.parseEther(String(10.0))],
    [await addr9.getAddress(), ethers.utils.parseEther(String(10.0))]
  ];
  console.log(rewards)
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

  const RewardPool = await ethers.getContractFactory('RewardPool');
  const rewardPool = await RewardPool.attach(config.rewardPoolAddress);
  await rewardPool
    .connect(owner)
    .grantRole(
      await rewardPool.DISTRIBUTOR_ROLE(),
      distributor.address
    );
  mine(2);
  const dailyCumulativeRewards = ethers.utils.parseEther('1000');
  await rewardPool
    .connect(distributor)
    .submitMerkleRoot(tree.root, dailyCumulativeRewards);
  
  const txnGetRoot = await rewardPool.connect(distributor).roots(0);
  console.log('Submitted Root Hash: ' + txnGetRoot);
  console.log('Daily Total Cumulative Rewards: ' + dailyCumulativeRewards);
  fs.writeFileSync(
    __dirname + '/../frontend/src/contracts/tree.json',
    JSON.stringify(tree.dump()),
    'utf-8'
  );
  console.log("Generated tree json in: "+__dirname + '/../frontend/src/contracts/tree.json')
  fs.writeFileSync(
    __dirname + '/../frontend/src/contracts/proofs.json',
    JSON.stringify(proofs),
    'utf-8'
  );
  console.log("Generated proofs in: "+__dirname + '/../frontend/src/contracts/proofs.json')
  // the following increase the timestamp in local hardhat node by 1 day 
  // so its possible to resubmit the root hash with increased cumulative rewards per account
  // to evaluate the updated state in smart contracts through the frontend
  // await time.increase(90000);
}

simulate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { simulate };