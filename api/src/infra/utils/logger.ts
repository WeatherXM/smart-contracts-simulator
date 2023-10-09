import { createLogger, format, transports, config } from 'winston'
import { TransformableInfo } from 'logform'

const formatter = (info: TransformableInfo): string => {
  if (info.stack !== null && info.stack !== undefined) {
    return `${info.timestamp as string} ${info.level}: ${info.message as string} - ${info.stack as string}`
  } else {
    return `${info.timestamp as string} ${info.level}: ${info.message as string}`
  }
}

export const logger = createLogger({
  levels: config.syslog.levels,
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.splat(),
    format.printf(formatter)
  ),
  transports: [
    new transports.Console({
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.splat(),
        format.printf(formatter)
      )
    })
  ]
})
