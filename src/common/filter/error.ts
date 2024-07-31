import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = exception.message || 'Internal server error';
    if (
      exception?.response?.message &&
      Array.isArray(exception.response.message)
    ) {
      message = exception.response.message;
    }

    response.status(status).json({
      success: false,
      code: status,
      timestamp: Date.now(),
      path: request.url,
      message,
    });
  }
}
