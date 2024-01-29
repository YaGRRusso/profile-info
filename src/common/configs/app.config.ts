import * as dotenv from 'dotenv'
import { INestApplication } from '@nestjs/common'

dotenv.config()

export const appConfig = async (app: INestApplication) => {
  const port = Number(process.env.PORT) ?? 8080
  const host = process.env.HOST ?? '0.0.0.0'

  return await app.listen(port, host)
}
