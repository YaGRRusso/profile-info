import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { ValidationError } from 'class-validator'

@Catch()
export class CommonFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: Record<string, unknown>, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse()

    let status = 500
    let name = 'Internal server error'
    let message = 'Unknown error occurred'
    console.error(exception)

    if (exception instanceof PrismaClientKnownRequestError) {
      status = 400
      name = 'Bad request'

      switch (exception.code) {
        case 'P2000':
          message = `The provided value for the column ${exception.meta?.target} is too long`
          break
        case 'P2002':
          message = `Unique constraint violation at ${exception.meta?.target}`
          break
        case 'P2003':
          message = `Foreign key constraint violation at ${exception.meta?.target}`
          break
        case 'P2025':
          message = 'Resource not found'
          break
      }
    }

    if (exception instanceof ValidationError) {
      status = 400
      name = 'Bad request'
      message = Object.values(exception.constraints)[0]
    }

    return res
      .status(+exception?.status || +exception?.statusCode || status)
      .json({
        ...exception,
        name,
        message,
      })
  }
}
