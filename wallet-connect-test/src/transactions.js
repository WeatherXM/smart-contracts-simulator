import { useAccount, useContractWrite, useBalance } from 'wagmi'

import contracts from '../src/contracts/config.json'

const Transactions = () => {
  const { address } = useAccount()
  const balance = useBalance({
    token: contracts.tokenAddress,
    address: address,
    chainId: 1337,
  })

  const { error, isLoading, isSuccess, write } = useContractWrite({
    address: contracts.tokenAddress,
    abi: contracts.tokenArtifact.abi,
    functionName: 'transfer',
    chainId: 1337,
  })

  console.log('file: transactions.js:20 -> error:', error)

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
            args: ['0x64251043A35ab5D11f04111B8BdF7C03BE9cF0e7', '20000000000000000000'],
            from: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
            value: '0',
          })
        }
        >
          Send 20 WXM
        </button>
        {isLoading ? (
          <div style={{marginTop: 20}}>
            Sending...
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