import { ethers, upgrades, network } from 'hardhat';
import WeatherXM from './artifacts/smart-contracts/src/WeatherXM.sol/WeatherXM.json';
import RewardsVault from './artifacts/smart-contracts/src/RewardsVault.sol/RewardsVault.json';
import RewardPool from './artifacts/smart-contracts/src/RewardPool.sol/RewardPool.json';
import ServicePool from './artifacts/smart-contracts/src/ServicePool.sol/ServicePool.json';
import fs from 'fs';
import path from 'path';
import { Contract } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

async function deploy() {
  const [deployer, rewardsChangeTreasury, treasury] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  console.log('Deploying token')
  const WeatherXMFactory = await ethers.getContractFactory(WeatherXM.abi, WeatherXM.bytecode);
  const weatherXm = await WeatherXMFactory.deploy('WeatherXM', 'WXM');

  console.log('Deploying usdt')
  const USDTFactory = await ethers.getContractFactory(WeatherXM.abi, WeatherXM.bytecode);
  const usdt = await USDTFactory.deploy('USDT', 'USDT');

  console.log('Deploying reward vault')
  const RewardsVaultFactory = await ethers.getContractFactory(RewardsVault.abi, RewardsVault.bytecode);
  const rewardVault = await RewardsVaultFactory.deploy(weatherXm.address, deployer.address);
  
  console.log('Deploying reward pool')
  const RewardPoolFactory = await ethers.getContractFactory(RewardPool.abi, RewardPool.bytecode);
  const rewardPool = await upgrades.deployProxy(
    RewardPoolFactory,
    [weatherXm.address, rewardVault.address, rewardsChangeTreasury.address],
    {
      initializer: 'initialize',
      kind: 'uups',
    }
  );
  await rewardPool.deployed();

  console.log('Deploying service pool')
  const ServicePoolFactory = await ethers.getContractFactory(ServicePool.abi, ServicePool.bytecode);
  const servicePool = await upgrades.deployProxy(
    ServicePoolFactory,
    [weatherXm.address, usdt.address, treasury.address],
    {
      initializer: 'initialize',
      kind: 'uups',
    }
  );
  await servicePool.deployed();

  console.log('Setting reward distributor')
  await rewardVault.setRewardDistributor(rewardPool.address);

  console.log('Transferring rewards to vault')
  await weatherXm.transfer(rewardVault.address, ethers.utils.parseUnits('55000', 'ether'))

  console.log('Adding services')
  await servicePool.addService(
    'serviceId1',
    'service 1',
    10,
    100
  )
  await servicePool.addService(
    'serviceId2',
    'service 2',
    10,
    200
  )
  await servicePool.addService(
    'serviceId3',
    'service 3',
    5,
    300
  )


  const config = {
    tokenName: await weatherXm.name(),
    tokenSymbol: await weatherXm.symbol(),
    tokenDecimals: await weatherXm.decimals(),
    tokenAddress: weatherXm.address,
    rewardVaultAddress: rewardVault.address,
    rewardPoolAddress: rewardPool.address,
    servicePoolAddress: servicePool.address,
    usdtAddress: usdt.address,

    tokenArtifact: WeatherXM,
    rewardPoolArtifact: RewardPool,
    servicePoolArtifact: ServicePool
  }

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

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { deploy };