"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleDuplicateError = (err) => {
    const match = err.message.match(/"([^"]*)"/);
    const extractedMesssage = match && match[1];
    const errorMessages = [
        {
            path: '',
            message: `${extractedMesssage} is already exists`
        }
    ];
    const statusCode = 400;
    return {
        statusCode,
        message: `${extractedMesssage} is already exists`,
        errorMessages
    };
};
exports.default = handleDuplicateError;
