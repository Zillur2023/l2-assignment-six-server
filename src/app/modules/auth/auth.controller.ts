import httpStatus from "http-status";
import config from "../../config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import AppError from "../../errors/AppError";



const loginUser = catchAsync(async (req, res) => {
    const result = await AuthServices.loginUser(req.body);
    const { user,refreshToken, accessToken } = result;
    console.log({accessToken})
  
    res.cookie('refreshToken', refreshToken, {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `${user?.email} is logged in succesfully!`,
      data: {
        token:accessToken,
      },
    });
  });

  const changePassword = catchAsync(async (req, res) => {
    const { ...passwordData } = req.body;
  
    const result = await AuthServices.changePassword(req.user, passwordData);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Password is updated succesfully!',
      data: result,
    });
  });
  
  const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies;
    const result = await AuthServices.refreshToken(refreshToken);
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Access token is retrieved succesfully!',
      data: result,
    });
  });
  
  const forgetPassword = catchAsync(async (req, res) => {
    const {email} = req.body;
    // const {email} = req.params;
    const result = await AuthServices.forgetPassword(email);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Reset link is generated succesfully!',
      data: result,
    });
  });
  
  const resetPassword = catchAsync(async (req, res) => {
    const token = req.headers.authorization;
    console.log('resetToken --> after',token)
  
    if (!token) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong !');
    }
  
    const result = await AuthServices.resetPassword(req.body, token);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Password reset succesfully!',
      data: result,
    });
  });

  export const AuthControllers = {
    loginUser,
    changePassword,
    refreshToken,
    forgetPassword,
    resetPassword,
  }