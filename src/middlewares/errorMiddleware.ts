import { Request, Response, NextFunction } from 'express';
import StatusCodes from 'http-status-codes';

import HttpException from '../exceptions/HttpException';

const errorMiddleware = (error: HttpException, _req: Request, res: Response, _next: NextFunction) => {
  res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR)
  .json({
    success: false,
    message: error.message,
    errors: error.errors,
  });
}

export default errorMiddleware;