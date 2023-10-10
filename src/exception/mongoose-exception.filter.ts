import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { MongoError } from 'mongodb';

@Catch(MongoError)
export class MongooseExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';

    // Check for duplicate key error (code 11000)
    if (exception.code === 11000) {
      statusCode = HttpStatus.CONFLICT; // 409 Conflict

     
      const duplicatedField = Object.keys((exception as any).keyValue)[0];

      if (duplicatedField === 'email') {
        message = 'User email is already in use';
      } else {
        message = `${duplicatedField} already exists`;
      }
    }


    response
      .status(statusCode)
      .json({
        statusCode: statusCode,
        message: message,
      });
  }
}