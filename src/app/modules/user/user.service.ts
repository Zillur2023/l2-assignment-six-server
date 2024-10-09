import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "./user.model";
import { IUser } from "./user.interface";
import { stringify } from "querystring";
import mongoose from "mongoose";

const createUserIntoDB = async (payload: Pick<IUser, 'name' | 'email' | 'password'>) => {
  
  // checking if the user is exist
  const isUserExist = await User.isUserExistsByEmail(payload.email);

  if (isUserExist) {
    throw new AppError(
      httpStatus.ALREADY_REPORTED,
      "This user is already exist!"
    );
  }
  const result = await User.create(payload);

  return result;
};

const getAllUserFromDB = async () => {
  const result = await User.find();

  return result;
};
const getUserFromDB = async (email: string) => {
  const result = await User.findOne({ email });

  return result;
};
const getUserByIdFromDB = async (id: string) => {
  const result = await User.findById(id);

  return result;
};

const updateUserIntoDB = async (payload: Record<string, unknown>) => {
  const user = await User.findByIdAndUpdate(payload._id, payload, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const updateUserFollowersIntoDB = async (id: string,payload: Record<string, unknown>) => {
  const userId = new mongoose.Types.ObjectId(id as string);
  const followerId = new mongoose.Types.ObjectId(payload.followers as string);

  const user = await User.findById(userId);
  const followerUser = await User.findById(followerId);

     if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found")
     if (!followerUser) throw new AppError(httpStatus.NOT_FOUND, "Follow User not found")

      if (!user.followers.some((id) => id.equals(followerId))) {
        user.followers.push(followerId);
        // followerUser.following = followerUser.following.filter(
        //   (followingId) => !followingId.equals(userId)
        // ); 
        followerUser.following.push(userId)
           
            await user.save();
        await followerUser.save();
      }
    }

const updateUserFolloweringIntoDB = async (id: string,payload: Record<string, unknown>) => {
  const userId = new mongoose.Types.ObjectId(id as string);
  const followingId = new mongoose.Types.ObjectId(payload.followering as string);
  
  const user = await User.findById(userId);
  const followingUser = await User.findById(followingId);

     if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found")
     if (!followingUser) throw new AppError(httpStatus.NOT_FOUND, "Following User not found")

      if (!user.following.some((id) => id.equals(followingId))) {
        user.following.push(followingId);  
        followingUser.followers.push(userId)
          await user.save();
        await followingUser.save();
      } else {
        user.following = user.following.filter(
          (followeringId) => !followeringId.equals(followingId)
        );  
        console.log('user.following',user.following)
        followingUser.followers = followingUser.followers.filter(
          (followerId) => !followerId.equals(userId)
        );  
        await user.save();
        await followingUser.save();
      }

}


export const UserServices = {
  createUserIntoDB,
  getAllUserFromDB,
  getUserFromDB,
  getUserByIdFromDB,
  updateUserIntoDB,
  updateUserFollowersIntoDB,
  updateUserFolloweringIntoDB
};
