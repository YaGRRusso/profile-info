import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'

@Catch()
export class CommonFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: Record<string, unknown>, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse()

    console.error(exception)
    return res.status(+exception?.status || +exception.statusCode || 500).json({
      data: null,
      error: {
        ...exception,
        message: exception.message,
      },
    })
  }
}
