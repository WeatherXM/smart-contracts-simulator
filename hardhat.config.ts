import '@openzeppelin/hardhat-upgrades';
import '@typechain/hardhat';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import '@nomicfoundation/hardhat-network-helpers';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const compilerConfig = (version: string) => ({
  version,
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      '*': {
        SavingsContract: ['storageLayout']
      }
    }
  }
});

const hardhatConfig: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: false,
      initialBaseFeePerGas: 0
    }
  },
  solidity: {
    compilers: [{ ...compilerConfig('0.8.18') }]
  },
  paths: {
    sources: './smart-contracts/src',
    cache: './scripts/cache',
    artifacts: './scripts/artifacts'
  },
  typechain: {
    outDir: 'types/generated',
    target: 'ethers-v5'
  }
};

export default hardhatConfig;
