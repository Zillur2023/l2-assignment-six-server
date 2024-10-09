"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const handleZodError_1 = __importDefault(require("../errors/handleZodError"));
const handleValidationError_1 = __importDefault(require("../errors/handleValidationError"));
const handleCastError_1 = __importDefault(require("../errors/handleCastError"));
const handleCuplicateError_1 = __importDefault(require("../errors/handleCuplicateError"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const globalErrorHandler = (err, req, res, next) => {
    // const globalErrorHandler = (err:any, req:Request, res:Response, next:NextFunction) => {
    let statusCode = 400;
    let message = err.message || 'Something went wrong!';
    let errorMessages = [
        {
            path: '',
            message: 'Something went wrong',
        },
    ];
    // if (err?.name === 'ZodError') {
    if (err instanceof zod_1.ZodError) {
        const simplifiedError = (0, handleZodError_1.default)(err);
        statusCode = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.statusCode;
        message = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.message;
        errorMessages = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.errorMessages;
    }
    else if ((err === null || err === void 0 ? void 0 : err.name) === "ValidationError") {
        const simplifiedError = (0, handleValidationError_1.default)(err);
        statusCode = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.statusCode;
        message = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.message;
        errorMessages = simplifiedError === null || simplifiedError === void 0 ? void 0 : simplifiedError.errorMessages;
    }
    else if (err.name === 'CastError') {
        const simplifiedError = (0, handleCastError_1.default)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessages = simplifiedError.errorMessages;
    }
    else if ((err === null || err === void 0 ? void 0 : err.code) === 11000) {
        const simplifiedError = (0, handleCuplicateError_1.default)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessages = simplifiedError.errorMessages;
    }
    else if (err instanceof AppError_1.default) {
        statusCode = err === null || err === void 0 ? void 0 : err.statusCode;
        message = err === null || err === void 0 ? void 0 : err.message;
        errorMessages = [
            {
                path: '',
                message: err === null || err === void 0 ? void 0 : err.message
            }
        ];
    }
    else if (err instanceof Error) {
        message = err === null || err === void 0 ? void 0 : err.message;
        errorMessages = [
            {
                path: '',
                message: err === null || err === void 0 ? void 0 : err.message
            }
        ];
    }
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errorMessages,
        // err,
        // stack: config.NODE_ENV === 'development' ? err?.stack : null,
        stack: err === null || err === void 0 ? void 0 : err.stack
    });
};
exports.default = globalErrorHandler;
