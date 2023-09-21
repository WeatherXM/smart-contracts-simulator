import { Address, ContractAbi, Web3 } from 'web3'
import { output as config } from '../infra/utils/config'

export const getContractMethodTxData = async (
  from: Address,
  to: Address,
  abi: ContractAbi,
  method: any,
  params: String[] = [],
  value = '0'
) => {
  const web3 = new Web3(config.rpc_url);

  const contractInstance = new web3.eth.Contract(abi, to, {from})

  // @ts-ignore
  const gasLimit = await contractInstance.methods[method](...params).estimateGas()
  // @ts-ignore
  const data = contractInstance.methods[method](...params).encodeABI()

  return {
    from,
    to,
    data,
    gasLimit,
    value
  }
}