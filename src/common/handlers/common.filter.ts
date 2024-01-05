import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'

@Catch()
export class CommonFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse()

    return res.status(+exception.status || +exception.statusCode || 500).json({
      data: null,
      error: exception,
    })
  }
}
