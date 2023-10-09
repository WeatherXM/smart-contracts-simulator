import { NextFunction, Request, Response, Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import { getContractMethodTxData } from '../../../services/web3'
import contracts from '../../../contracts/config.json'

export const make = (): Router => {
  const router = Router()

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get('/api/v1/txs/claim/:userAddress', async (req: Request, res: Response, next: NextFunction) => {
    const from = req.params.userAddress;
    const amount = req.query.amount;

    const contractAddress = contracts.rewardPoolAddress
    const abi = contracts.rewardPoolArtifact.abi
    const result = await getContractMethodTxData(
      from,
      contractAddress,
      abi,
      'claim',
      [],
      '0'
    )

    res.status(StatusCodes.OK).json(result)
  })

  return router
}
