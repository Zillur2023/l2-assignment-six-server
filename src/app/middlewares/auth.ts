// import AppError from "../errors/AppError";
// import catchAsync from "../utils/catchAsync";
// import config from "../config";
// import { NextFunction, Request, Response } from "express";
// import httpStatus from "http-status";
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import { User } from "../modules/user/user.model";
// import { IUserRole } from "../modules/user/user.interface";

// const auth = (...requiredRoles: IUserRole[]) => {
//   return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     // Token can be passed via Authorization header or cookies
//     let token = req.headers.authorization;
//     // let token = req.cookies.refreshToken;

//     // Handle Bearer token in the Authorization header
//     if (token && token.startsWith("Bearer ")) {
//       token = token.split(" ")[1]; // Extract token after "Bearer"
//     } else if (req.cookies && req.cookies.refreshToken) {
//       // Fallback: check if token is present in cookies
//       token = req.cookies.refreshToken;
//     } else {
//       throw new AppError(httpStatus.UNAUTHORIZED, "Authorization token missing.");
//     }

//     let decoded;

//     try {
//       // Verify the token
//       // decoded = jwt.verify(token as string, config.jwt_access_secret as string) as JwtPayload;
//       decoded = jwt.verify(token as string, config.jwt_refresh_secret as string) as JwtPayload;
//     } catch (error) {
//       throw new AppError(httpStatus.UNAUTHORIZED, "UNAUTHORIZED");
//     }

//     const { role, email, iat } = decoded;

//     // Check if the user exists in the system
//     const user = await User.isUserExistsByEmail(email);
//     if (!user) {
//       throw new AppError(httpStatus.NOT_FOUND, "User not found.");
//     }

//     // Check if the user has been deleted
//     if (user.isDeleted) {
//       throw new AppError(httpStatus.FORBIDDEN, "This user account has been deleted.");
//     }

//     // Check if the user is blocked
//     if (user.status === 'blocked') {
//       throw new AppError(httpStatus.FORBIDDEN, "This user account is blocked.");
//     }

//     // Check if the JWT was issued before the password was changed
//     if (user.passwordChangedAt && User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)) {
//       throw new AppError(httpStatus.UNAUTHORIZED, "Token is invalid due to a recent password change.");
//     }

//     // Check if the user's role matches the required roles
//     if (requiredRoles.length > 0 && !requiredRoles.includes(role as IUserRole)) {
//       throw new AppError(httpStatus.FORBIDDEN, "You do not have the necessary permissions to access this resource.");
//     }

//     // Attach the user information to the request for further use
//     req.user = { ...decoded, role }; // Add role explicitly for convenience

//     // Proceed to the next middleware or route handler
//     next();
//   });
// };

// export default auth;
