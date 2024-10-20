import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "./user.model";
import { IUser } from "./user.interface";
import { stringify } from "querystring";
import mongoose from "mongoose";
import Post from "../post/post.model";
import { emitWarning } from "process";
import { initiatePayment } from "../payment/payment.utils";

// const createUserIntoDB = async (payload: Pick<IUser, 'name' | 'email' | 'password'>) => {
const createUserIntoDB = async (payload: IUser) => {
  
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

const updateUserProfileIntoDB = async (payload: IUser) => {
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

    const updateFollowAndUnfollowIntoDB = async (targetUserId: string, currentUser: IUser) => {
      const session = await mongoose.startSession();
      session.startTransaction();
    
      try {
        const targetUser = await User.findById(targetUserId).session(session);
        const loggedInUser = await User.findById(currentUser?._id).session(session);
    
        if (!loggedInUser) throw new AppError(httpStatus.NOT_FOUND, "Current user not found");
        if (!targetUser) throw new AppError(httpStatus.NOT_FOUND, "Target user not found");
    
        const isFollowing = loggedInUser.following.some((id) => id.equals(targetUserId));
    
        if (!isFollowing) {
          await User.findByIdAndUpdate(
            loggedInUser._id,
            { $addToSet: { following: targetUserId } },
            { session }
          );
    
          await User.findByIdAndUpdate(
            targetUserId,
            { $addToSet: { followers: loggedInUser._id } },
            { session }
          );
        } else {
          await User.findByIdAndUpdate(
            loggedInUser._id,
            { $pull: { following: targetUserId } },
            { session }
          );
    
          await User.findByIdAndUpdate(
            targetUserId,
            { $pull: { followers: loggedInUser._id } },
            { session }
          );
        }
    
        await session.commitTransaction();
        session.endSession();
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    };
    
    const isAvailableForVerifiedIntoDB = async (id: string): Promise<boolean> => {
      const user = await User.findById(id);
    
      // Return false if the user doesn't exist
      if (!user) {
        return false;
      }
    
      // Query 1: Find posts with upvotes that include the user
      const postsWithUserUpvoted = await Post.find({
        author: id,
        $expr: { $gt: [{ $size: "$upvotes" }, 0] },
        upvotes: { $elemMatch: { $eq: user._id } } // User is in the upvotes array
      });
    
      // If there are more than 1 post where the user has been upvoted, return true
      if (postsWithUserUpvoted.length > 1) {
        return true;
      }
    
      // Query 2: Find posts with upvotes but the user is not in the upvotes array
      const postsWithoutUserUpvoted = await Post.find({
        author: id,
        $expr: { $gt: [{ $size: "$upvotes" }, 0] },
        upvotes: { $not: { $elemMatch: { $eq: user._id } } } // User is not in the upvotes array
      });
    
      // If there are any such posts, return true
      if (postsWithoutUserUpvoted.length > 0) {
        return true;
      }
    
      // Otherwise, return false
      return false;
    };

const updateVerifiedIntoDB = async (id:string) => {
    const user = await User.findById(id)

    if(!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }
    const upvotes = await Post.find({author:id, $expr: { $gt: [{ $size: "$upvotes" }, 0] }} )

    if(!upvotes) {
      throw new AppError(httpStatus.NOT_FOUND, "This user have no upvote in his post")
    }

    const transactionId = `TXN-${Date.now()}`;
  
    // const result = await User.findByIdAndUpdate(id, {transactionId, paymentStatus:'paid'},{ new: true })

    const paymentData = {
        id: user?._id,
        transactionId,
        price: 100,
        name: user?.name,
        email: user?.email,
    }

    const paymentSession = await initiatePayment(paymentData)

    // return result
    return {paymentSession}
}


export const UserServices = {
  createUserIntoDB,
  getAllUserFromDB,
  getUserFromDB,
  getUserByIdFromDB,
  updateUserProfileIntoDB,
  updateUserFollowersIntoDB,
  updateFollowAndUnfollowIntoDB,
  isAvailableForVerifiedIntoDB,
  updateVerifiedIntoDB
};



// const updateFollowAndUnfollowIndoDB = async (id: string,payload: IUser) => {
//   console.log({payload})
//   const userId = new mongoose.Types.ObjectId(payload._id);
//   const followingId = new mongoose.Types.ObjectId(id);
  
//   const user = await User.findById(userId);
//   const followingUser = await User.findById(followingId);

//      if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found")
//      if (!followingUser) throw new AppError(httpStatus.NOT_FOUND, "Following User not found")

//       if (!user.following.some((id) => id.equals(followingId))) {
//         user.following.push(followingId);  
//         followingUser.followers.push(userId)
//           await user.save();
//         await followingUser.save();
//       } else {
//         user.following = user.following.filter(
//           (followeringId) => !followeringId.equals(followingId)
//         );  
//         console.log('user.following',user.following)
//         followingUser.followers = followingUser.followers.filter(
//           (followerId) => !followerId.equals(userId)
//         );  
//         await user.save();
//         await followingUser.save();
//       }

// }
