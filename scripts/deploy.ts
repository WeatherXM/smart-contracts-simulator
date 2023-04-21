import { ethers, upgrades, network } from 'hardhat';
import WeatherXMData from '../artifacts/src/WeatherXMData.sol/WeatherXMData.json';
import WeatherXM from '../artifacts/src/WeatherXM.sol/WeatherXM.json';
import WeatherStationXM from '../artifacts/src/WeatherStationXM.sol/WeatherStationXM.json';
import RewardPool from '../artifacts/src/RewardPool.sol/RewardPool.json';
import BurnPool from '../artifacts/src/BurnPool.sol/BurnPool.json';
import PriceFeedConsumer from '../artifacts/src/PriceFeedConsumer.sol/PriceFeedConsumer.json';
import MockV3Aggregator from '../artifacts/src/mocks/oracle/MockV3Aggregator.sol/MockV3Aggregator.json';
import fs from 'fs';
import path from 'path';
import { Contract } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const WeatherData = await ethers.getContractFactory(WeatherXMData.abi, WeatherXMData.bytecode);
  const data = await upgrades.deployProxy(WeatherData, {
    initializer: 'initialize',
    kind: 'uups'
  });
  console.log('WeatherXMData hash:', data.deployTransaction.hash);
  await data.deployed();
  console.log('WeatherXMData deployed to:', data.address);

  const Token = await ethers.getContractFactory(WeatherXM.abi, WeatherXM.bytecode);
  const token = await Token.deploy('WeatherXM', 'WXM', data.address);
  console.log('WeatherXM hash:', token.deployTransaction.hash);
  await token.deployed();
  console.log('Token address:', token.address);

  const WeatherStation = await ethers.getContractFactory(WeatherStationXM.abi, WeatherStationXM.bytecode);
  const weatherStationXM = await WeatherStation.deploy(
    'WeatherStationXM',
    'WSWXM'
  );
  console.log(
    'WeatherStationXM hash:',
    weatherStationXM.deployTransaction.hash
  );
  await weatherStationXM.deployed();
  console.log('WeatherStationXM deployed to:', weatherStationXM.address);

  const Rewardpool = await ethers.getContractFactory(RewardPool.abi, RewardPool.bytecode);
  const rewardPool = await upgrades.deployProxy(
    Rewardpool,
    [token.address, data.address],
    {
      initializer: 'initialize',
      kind: 'uups'
    }
  );
  console.log('RewardPool hash:', rewardPool.deployTransaction.hash);
  await rewardPool.deployed();
  console.log('RewardPool deployed to:', rewardPool.address);
  let priceFeedAddress: string | undefined;
  let mockV3Aggregator: Contract;
  const priceConsumerV3Factory = await ethers.getContractFactory(
    PriceFeedConsumer.abi,
    PriceFeedConsumer.bytecode
  );
  const DECIMALS = '18';
  const INITIAL_PRICE = '430000000000000000';
  const mockV3AggregatorFactory = await ethers.getContractFactory(
    MockV3Aggregator.abi,
    MockV3Aggregator.bytecode
  );
  mockV3Aggregator = await mockV3AggregatorFactory.deploy(
    DECIMALS,
    INITIAL_PRICE
  );
  priceFeedAddress = mockV3Aggregator.address;

  const priceConsumerV3 = await priceConsumerV3Factory.deploy(priceFeedAddress);
  await priceConsumerV3.deployed();
  
  const Burnpool = await ethers.getContractFactory(BurnPool.abi, BurnPool.bytecode);
  const burnPool = await upgrades.deployProxy(
    Burnpool,
    [
      token.address,
      data.address,
      weatherStationXM.address,
      priceConsumerV3.address
    ],
    {
      initializer: 'initialize',
      kind: 'uups'
    }
  );
  console.log('BurnPool hash:', burnPool.deployTransaction.hash);
  await burnPool.deployed();
  console.log('BurnPool deployed to:', burnPool.address);

  const config = {
    tokenName: await token.name(),
    tokenSymbol: await token.symbol(),
    tokenDecimals: await token.decimals(),
    tokenAddress: token.address,
    tokenDeploymentHash: token.deployTransaction.hash,
    weatherDataAddress: data.address,
    weatherDataDeploymentHash: data.deployTransaction.hash,
    weatherStationAddress: weatherStationXM.address,
    weatherStationDeploymentHash: weatherStationXM.deployTransaction.hash,
    rewardPoolAddress: rewardPool.address,
    rewardPoolDeploymentHash: rewardPool.deployTransaction.hash,
    burnPoolAddress: burnPool.address,
    burnPoolDeploymentHash: burnPool.deployTransaction.hash,
    priceConsumerAddress: priceConsumerV3.address,
    priceConsumerDeploymentHash: priceConsumerV3.deployTransaction.hash,
    rewardPool_DISTRIBUTOR_ROLE: await rewardPool.DISTRIBUTOR_ROLE(),
    burnPool_ADMIN_ROLE: await burnPool.DEFAULT_ADMIN_ROLE(),
    burnPool_UPGRADER_ROLE: await burnPool.UPGRADER_ROLE(),
    burnPool_MANUFACTURER_ROLE: await burnPool.MANUFACTURER_ROLE(),
    weatherStationXM_PROVISIONER_ROLE:
      await weatherStationXM.PROVISIONER_ROLE(),
    weatherStationXM_MANUFACTURER_ROLE:
      await weatherStationXM.MANUFACTURER_ROLE(),
    tokenArtifact: WeatherXM,
    dataArtifact: WeatherXMData,
    priceConsumerArtifact: PriceFeedConsumer,
    weatherStationArtifact: WeatherStationXM,
    rewardPoolArtifact:RewardPool,
    burnPoolArtifact: BurnPool
  };
  if (network.name == 'localhost') {
    fs.writeFileSync(
      __dirname + '/../frontend/src/contracts/config.json',
      JSON.stringify(config, null, '\t'),
      'utf-8'
    );
  } else {
    fs.writeFileSync(
      path.join(__dirname, '/config.json'),
      JSON.stringify(config, null, '\t'),
      'utf-8'
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
