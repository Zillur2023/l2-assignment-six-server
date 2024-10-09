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
const AppError_1 = __importDefault(require("../errors/AppError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const config_1 = __importDefault(require("../config"));
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../modules/user/user.model");
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        // Token can be passed via Authorization header or cookies
        let token = req.headers.authorization;
        // let token = req.cookies.refreshToken;
        // Handle Bearer token in the Authorization header
        if (token && token.startsWith("Bearer ")) {
            token = token.split(" ")[1]; // Extract token after "Bearer"
        }
        else if (req.cookies && req.cookies.refreshToken) {
            // Fallback: check if token is present in cookies
            token = req.cookies.refreshToken;
        }
        else {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Authorization token missing.");
        }
        let decoded;
        try {
            // Verify the token
            // decoded = jwt.verify(token as string, config.jwt_access_secret as string) as JwtPayload;
            decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_refresh_secret);
        }
        catch (error) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "UNAUTHORIZED");
        }
        const { role, email, iat } = decoded;
        // Check if the user exists in the system
        const user = yield user_model_1.User.isUserExistsByEmail(email);
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
        }
        // Check if the user has been deleted
        if (user.isDeleted) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user account has been deleted.");
        }
        // Check if the user is blocked
        if (user.status === 'blocked') {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This user account is blocked.");
        }
        // Check if the JWT was issued before the password was changed
        if (user.passwordChangedAt && user_model_1.User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat)) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Token is invalid due to a recent password change.");
        }
        // Check if the user's role matches the required roles
        if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You do not have the necessary permissions to access this resource.");
        }
        // Attach the user information to the request for further use
        req.user = Object.assign(Object.assign({}, decoded), { role }); // Add role explicitly for convenience
        // Proceed to the next middleware or route handler
        next();
    }));
};
exports.default = auth;
