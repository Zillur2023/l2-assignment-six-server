import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { TErrorMessages } from "../interface/error";
import handleZodError from "../errors/handleZodError";
import handleValidationError from "../errors/handleValidationError";
import handleCastError from "../errors/handleCastError";
import handleDuplicateError from "../errors/handleCuplicateError";
import AppError from "../errors/AppError";


const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // const globalErrorHandler = (err:any, req:Request, res:Response, next:NextFunction) => {
    let statusCode = 400;
    let message = err.message ||'Something went wrong!';
    let errorMessages: TErrorMessages = [
      {
        path: '',
        message: 'Something went wrong',
      },
    ];
  
    // if (err?.name === 'ZodError') {
    if (err instanceof ZodError) {
      const simplifiedError = handleZodError(err);
      statusCode = simplifiedError?.statusCode;
      message = simplifiedError?.message;
      errorMessages = simplifiedError?.errorMessages;
    } else if (err?.name === "ValidationError") {
      const simplifiedError = handleValidationError(err)
      statusCode = simplifiedError?.statusCode
      message = simplifiedError?.message
      errorMessages = simplifiedError?.errorMessages
    } else if( err.name === 'CastError') {
      const simplifiedError = handleCastError(err)
      statusCode = simplifiedError.statusCode
      message = simplifiedError.message
      errorMessages = simplifiedError.errorMessages
    } else if(err?.code === 11000) {
      const simplifiedError = handleDuplicateError(err)
      statusCode = simplifiedError.statusCode
      message = simplifiedError.message
      errorMessages = simplifiedError.errorMessages
    } else if( err instanceof AppError) {
      statusCode = err?.statusCode
      message = err?.message
      errorMessages = [
        {
          path: '',
          message: err?.message
        }
      ]
    } else if(err instanceof Error) {
      message = err?.message
      errorMessages = [
        {
          path: '',
          message: err?.message
        }
      ]
    }

  
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errorMessages,
      // err,
      // stack: config.NODE_ENV === 'development' ? err?.stack : null,
      stack:  err?.stack 
    });

  };
  
  export default globalErrorHandler;