"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, data) => {
    res.status(data === null || data === void 0 ? void 0 : data.statusCode).json({
        statusCode: data.statusCode,
        success: data === null || data === void 0 ? void 0 : data.success,
        message: data.message,
        token: data.token,
        meta: data.meta,
        data: data.data,
    });
};
exports.default = sendResponse;
