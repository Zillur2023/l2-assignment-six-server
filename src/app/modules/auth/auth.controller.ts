import httpStatus from "http-status";
import config from "../../config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";



const loginUser = catchAsync(async (req, res) => {
    const result = await AuthServices.loginUser(req.body);
    const { user,refreshToken, accessToken } = result;
  
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
        user,
        token:accessToken,
      },
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

  export const AuthControllers = {
    loginUser,
    refreshToken,
  }