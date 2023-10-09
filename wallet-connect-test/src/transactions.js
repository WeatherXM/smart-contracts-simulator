import { useAccount, useContractWrite, useBalance } from 'wagmi'
import Web3 from 'web3'

import contracts from '../src/contracts/config.json'
import proofs from '../src/contracts/proofs.json'

const Transactions = () => {
  const { address } = useAccount()
  const balance = useBalance({
    token: contracts.tokenAddress,
    address: address,
    chainId: 5,
  })

  const { error, isLoading, isSuccess, write } = useContractWrite({
    address: contracts.rewardPoolAddress,
    abi: contracts.rewardPoolArtifact.abi,
    functionName: 'claim',
    chainId: 1337,
  })

  

  return (
    <>
      <div style={{marginTop: 20}}>
        WXM Balance: {balance && balance.data ? balance.data.formatted : 0}
      </div>

      <div style={{marginTop: 20}}>
        <button
        disabled={!write}
        onClick={() =>
          write({
            args: [
              Web3.utils.toWei('1', 'ether'), // amount to claim
              Web3.utils.toWei(proofs[address].cumulativeAmount, 'ether'), // total allocated
              '0', // cycle
              proofs[address].proof
            ],
            value: '0',
          })
        }
        >
          Claim
        </button>
        {isLoading ? (
          <div style={{marginTop: 20}}>
            Claiming...
          </div>
        ) : null}
        {isSuccess ? (
          <div style={{marginTop: 20}}>
            Success
          </div>
        ) : null}
        {error ? (
          <div style={{marginTop: 20}}>
            {error.message}
          </div>
        ) : null}
      </div>
    </>
  )
}

export default Transactions