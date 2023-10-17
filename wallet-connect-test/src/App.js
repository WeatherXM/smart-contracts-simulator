import logo from './logo.svg';
import './App.css';

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
import { arbitrumGoerli } from 'wagmi/chains'

import Transactions from './transactions'

// 1. Get projectId
const projectId = '09370c1df96484fa5c783b66e0a0283d'

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [arbitrumGoerli]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

const featuredWalletIds = [
  'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'
]

const includeWalletIds = [
  'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
  'e9ff15be73584489ca4a66f64d32c4537711797e30b6660dbcb71ea72a42b1f4',
  'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
  'f2436c67184f158d1beda5df53298ee84abfc367581e4505134b5bcf5f46697d',
  '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150',
  'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18',
  'ef333840daf915aafdc4a004525502d6d49d77bd9c65e0642dbaefb3c2893bef',
  '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4',
  '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
  '84b43e8ddfcd18e5fcb5d21e7277733f9cccef76f7d92c836d0e481db0c70c04'

]

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains, includeWalletIds })

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <WagmiConfig config={wagmiConfig}>
          <w3m-button/>
          <Transactions/>
        </WagmiConfig>
      </header>
    </div>
  );
}

export default App;
