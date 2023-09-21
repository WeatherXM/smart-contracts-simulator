import logo from './logo.svg';
import './App.css';

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal, Web3Button } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig, Chain } from 'wagmi'

import Transactions from './transactions'

const wxm = {
  id: 111111111,
  name: 'WeatherXM',
  network: 'wxm',
  nativeCurrency: {
    decimals: 18,
    name: 'WeatherXM',
    symbol: 'WXM',
  },
  rpcUrls: {
    public: { http: ['http://13.42.17.5:8545/'] },
    default: { http: ['http://13.42.17.5:8545/'] },
  },
  blockExplorers: {
    etherscan: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
  contracts: {},
}

const chains = [wxm]
const projectId = '09370c1df96484fa5c783b66e0a0283d'

const { publicClient } = configureChains(
  chains,
  [
    w3mProvider({ projectId }),
  ]
)

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})

const ethereumClient = new EthereumClient(wagmiConfig, chains)

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <WagmiConfig config={wagmiConfig}>
          <Web3Button />
          <Transactions/>
        </WagmiConfig>

        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />

      </header>
    </div>
  );
}

export default App;
