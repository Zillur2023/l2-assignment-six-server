import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { createToken, verifyToken } from "./auth.utils";
import config from "../../config";
import { User } from "../user/user.model";
import { ILoginUser } from "./auth.interface";


const loginUser = async (payload: ILoginUser) => {
  // checking if the user is exist
  const isUserExist = await User.isUserExistsByEmail(payload.email);

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted

  const isDeleted = isUserExist?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked

  const userStatus = isUserExist?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload?.password, isUserExist?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  //create token and sent to the  client

  const jwtPayload = {
    // userId: user.id,
    // _id: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  const user = {
    name:isUserExist?.name,
    email:isUserExist?.email,
    role: isUserExist?.role
  }

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { email, iat } = decoded;

  // checking if the user is exist
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  // if (
  //   user.passwordChangedAt &&
  //   User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  // ) {
  //   throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !');
  // }

  const jwtPayload = {
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

export const AuthServices = {
  loginUser,
  refreshToken
}