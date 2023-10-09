import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const configSchema = z.object({
  isDevelopment: z.boolean(),
  port: z.number(),
  rpc_url: z.string()
}).strict()

const config = {

  // Check if app is running in development mode
  isDevelopment: process.env.NODE_ENV === 'development',

  port: process.env.PORT !== undefined ? Number(process.env.PORT) : 3001,
  rpc_url: process.env.RPC
}

// Validate configuration
export const output = configSchema.parse(config)
