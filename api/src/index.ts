import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { logger } from './infra/utils/logger'
import { output as config } from './infra/utils/config'
import * as txDataRouters from './controllers/https/txData/router'

const main = async (): Promise<void> => {
  const app = express()
  const txDataRouter = txDataRouters.make()

  app.use(morgan('short', {
    stream: {
      write: (message) => logger.log('info', message.trim())
    }
  }))

  app.use(cors())
  app.use(express.json())
  app.use(helmet())
  app.use(txDataRouter)

  app.listen(config.port)
}

main()
  .then(() => {
    console.log('Transactions api monitor started')
  })
  .catch(err => {
    console.log(`Transactions api exited due to ${err.message as string}`)
  })
