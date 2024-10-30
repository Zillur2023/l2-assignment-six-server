import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { createToken, verifyToken } from "./auth.utils";
import config from "../../config";
import { User } from "../user/user.model";
import { ILoginUser } from "./auth.interface";
<<<<<<< HEAD
import jwt,{ JwtPayload } from "jsonwebtoken";
=======
import jwt, { JwtPayload } from 'jsonwebtoken';
>>>>>>> 47887c9c5d66776b87d3bff15332eac8f84e7ab0
import bcrypt from 'bcrypt';
import { sendEmail } from "../../utils/sendEmail";



const loginUser = async (payload: ILoginUser) => {
  // checking if the user is exist
  const isUserExist = await User.findOne({email: payload.email});

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

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  // checking if the user is exist
  const user = await User.findOne({email: userData.email});

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

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
<<<<<<< HEAD
      id: userData.userId,
=======
      email: userData.email,
>>>>>>> 47887c9c5d66776b87d3bff15332eac8f84e7ab0
      role: userData.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );

  return null;
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { email, iat } = decoded;

  // checking if the user is exist
<<<<<<< HEAD
  const user = await User.findOne(email);
=======
  const user = await User.findOne({email});
>>>>>>> 47887c9c5d66776b87d3bff15332eac8f84e7ab0

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

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !');
  }

  const jwtPayload = {
    email: user?.email,
    role: user?.role,
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

<<<<<<< HEAD
const forgetPassword = async (payload: any) => {
  // checking if the user is exist
  // console.log({payload})
  const user = await User.findOne({email: payload?.email});
=======
const forgetPassword = async (email: string) => {
  // checking if the user is exist
  const user = await User.findOne({email});
>>>>>>> 47887c9c5d66776b87d3bff15332eac8f84e7ab0

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

  const jwtPayload = {
<<<<<<< HEAD
    // userId: user.id,
    // _id: isUserExist._id,
    email: user?.email,
    role: user?.role,
=======
    email: user.email,
    role: user.role,
>>>>>>> 47887c9c5d66776b87d3bff15332eac8f84e7ab0
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m',
  );

<<<<<<< HEAD
  console.log({resetToken})

  // const resetUILink = `${config.reset_pass_ui_link}?id=${user.id}&token=${resetToken} `;
  const resetUILink = `http://localhost:3000/reset-password?email=${user?.email}&token=${resetToken} `;

  const email = sendEmail(user.email, resetUILink);

  if(!email) {
    throw new AppError(httpStatus.NON_AUTHORITATIVE_INFORMATION, "Failed to send email ")
  }

  // console.log(resetUILink);

  return resetUILink
};

const resetPassword = async (
  payload: { email: string; newPassword: string; token: string, },
  
) => {
  console.log("resetPassword payload  ", payload)
  // checking if the user is exist
  const user = await User.findOne({email: payload?.email});
=======
  const resetUILink = `${config.reset_pass_ui_link}?id=${user.id}&token=${resetToken} `;

  sendEmail(user.email, resetUILink);

  console.log(resetUILink);
};

const resetPassword = async (
  payload: { id: string; newPassword: string },
  token: string,
) => {
  // checking if the user is exist
  const user = await User.findById(payload?.id);
>>>>>>> 47887c9c5d66776b87d3bff15332eac8f84e7ab0

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

  const decoded = jwt.verify(
<<<<<<< HEAD
    payload?.token,
=======
    token,
>>>>>>> 47887c9c5d66776b87d3bff15332eac8f84e7ab0
    config.jwt_access_secret as string,
  ) as JwtPayload;

  //localhost:3000?id=A-0001&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJBLTAwMDEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDI4NTA2MTcsImV4cCI6MTcwMjg1MTIxN30.-T90nRaz8-KouKki1DkCSMAbsHyb9yDi0djZU3D6QO4

<<<<<<< HEAD
  if (payload?.email !== decoded?.email) {
    console.log(payload?.email, decoded?.email);
=======
  if (payload.id !== decoded.userId) {
    console.log(payload.id, decoded.userId);
>>>>>>> 47887c9c5d66776b87d3bff15332eac8f84e7ab0
    throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden!');
  }

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
<<<<<<< HEAD
      email: decoded.email,
=======
      id: decoded.userId,
>>>>>>> 47887c9c5d66776b87d3bff15332eac8f84e7ab0
      role: decoded.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );
};
<<<<<<< HEAD
=======

>>>>>>> 47887c9c5d66776b87d3bff15332eac8f84e7ab0
export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
}