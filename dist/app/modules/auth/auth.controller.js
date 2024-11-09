"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const auth_service_1 = require("./auth.service");
const loginUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.AuthServices.loginUser(req.body);
    const { user, refreshToken, accessToken } = result;
    // res.cookie('accessToken', accessToken, {
    //   secure: config.NODE_ENV === 'production',
    //   httpOnly: true,
    //   // sameSite: true,
    //   // maxAge: 1000 * 60 * 60 * 24 * 365,
    // });
    // res.cookie('refreshToken', refreshToken, {
    //   secure: config.NODE_ENV === 'production',
    //   httpOnly: true,
    //   // sameSite: true,
    //   // maxAge: 1000 * 60 * 60 * 24 * 365,
    // });
    const isProduction = config_1.default.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
        secure: true, // Use HTTPS in production
        httpOnly: true, // Prevent client-side access
        sameSite: true, // Helps with CSRF protection
        maxAge: 1000 * 60 * 15, // 15 minutes
        // domain: isProduction ? '.vercel.app' : 'localhost', 
        path: '/',
    });
    res.cookie('refreshToken', refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: true,
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        // domain: isProduction ? '.vercel.app' : 'localhost',
        path: '/',
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `${user === null || user === void 0 ? void 0 : user.email} is logged in succesfully!`,
        data: {
            token: accessToken,
        },
    });
}));
const changePassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const { ...passwordData } = req.body;
    const result = yield auth_service_1.AuthServices.changePassword(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Password is changed succesfully!',
        data: result,
    });
}));
const refreshToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    const result = yield auth_service_1.AuthServices.refreshToken(refreshToken);
    const { accessToken } = result; // Assuming refreshToken method returns an object with the access token
    // Set the updated access token in the cookies
    res.cookie('accessToken', accessToken, {
        secure: config_1.default.NODE_ENV === 'production',
        httpOnly: true,
        // sameSite: true, 
        // maxAge: 1000 * 60 * 60 * 24 * 365, 
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Access token is retrieved succesfully!',
        data: result,
    });
}));
const forgetPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const {email} = req.body;
    const result = yield auth_service_1.AuthServices.forgetPassword(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Reset link is generated succesfully! ---> Check your email and reset password',
        data: result,
    });
}));
const resetPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const token = req.headers.authorization;
    // if (!token) {
    //   throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong !');
    // }
    const result = yield auth_service_1.AuthServices.resetPassword(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Password reset succesfully!',
        data: result,
    });
}));
exports.AuthControllers = {
    loginUser,
    changePassword,
    refreshToken,
    forgetPassword,
    resetPassword,
};
