import { AppModule } from './app.module'

import { repl } from '@nestjs/core'

const bootstrap = async () => {
  await repl(AppModule)
}

bootstrap()
