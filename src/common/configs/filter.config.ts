import { INestApplication } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { CommonFilter } from '@handlers/common.filter'

export const filtersConfig = (app: INestApplication) => {
  const { httpAdapter } = app.get(HttpAdapterHost)
  return app.useGlobalFilters(new CommonFilter(httpAdapter))
}
