import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const createUser = catchAsync(async (req, res) => {

  const result = await UserServices.createUserIntoDB({
    ...JSON.parse(req.body.data),
    image: req.file?.path
  });

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

const updateUserProfile = catchAsync(async (req, res) => {
  const result = await UserServices.updateUserProfileIntoDB({
    ...JSON.parse(req.body.data),
    image: req.file?.path
  });

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
const updateFollowAndUnfollow = catchAsync(async (req, res) => {
  const {id} = req.params
  const result = await UserServices.updateFollowAndUnfollowIntoDB(id,req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Following is updated successfully',
    data: result,
  });
});
const isAvailableForVerified = catchAsync(async (req, res) => {
  const {id} = req.params
  const result = await UserServices.isAvailableForVerifiedIntoDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Available for verified successfully',
    data: result,
  });
});
const updateVeirfied = catchAsync(async (req, res) => {
  const {id} = req.params
  const result = await UserServices.updateVerifiedIntoDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Verified update successfully',
    data: result,
  });
});

export const UserControllers = {
  createUser,
  getAllUser,
   getUser,
   getUserById,
   updateUserProfile,
   updateFollowers,
   updateFollowAndUnfollow,
   isAvailableForVerified,
   updateVeirfied,
}
