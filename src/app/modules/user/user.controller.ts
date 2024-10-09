import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const createUser = catchAsync(async (req, res) => {
  // const { password, student: studentData } = req.body;
  // console.log('createUser',req.body)

  const result = await UserServices.createUserIntoDB(req.body);
  // console.log({result})

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User is created succesfully`,
    data: result,
  });
});

const getAllUser = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUserFromDB()

  sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Get all user successfully',
      data: result
  })
})
const getUser = catchAsync(async (req, res) => {
  const {email} = req.params
  const result = await UserServices.getUserFromDB(email)

  sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User find successfully',
      data: result
  })
})
const getUserById = catchAsync(async (req, res) => {
  const {id} = req.params
  const result = await UserServices.getUserByIdFromDB(id)

  sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User find successfully',
      data: result
  })
})

const updateUser = catchAsync(async (req, res) => {
  // console.log('userBody', req.body)
  const result = await UserServices.updateUserIntoDB(req.body);
  // console.log('userResult', result)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is updated successfully',
    data: result,
  });
});
const updateFollowers = catchAsync(async (req, res) => {
  const {id} = req.params
  const result = await UserServices.updateUserFollowersIntoDB(id,req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Followers is updated successfully',
    data: result,
  });
});
const updateFollowing = catchAsync(async (req, res) => {
  // const {id} = req.params
  const result = await UserServices.updateUserFolloweringIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Following is updated successfully',
    data: result,
  });
});

export const UserControllers = {
  createUser,
  getAllUser,
   getUser,
   getUserById,
   updateUser,
   updateFollowers,
   updateFollowing
}
