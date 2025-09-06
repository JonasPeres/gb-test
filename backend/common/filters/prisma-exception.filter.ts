import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.code === 'P2002') {
      return response.status(409).json({
        statusCode: 409,
        message: 'SKU já existe (violação de unicidade)',
        error: 'Conflict',
      });
    }

    return response.status(400).json({
      statusCode: 400,
      message: exception.message,
      error: 'Bad Request',
    });
  }
}