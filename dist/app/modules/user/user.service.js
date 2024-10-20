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
exports.UserServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const user_model_1 = require("./user.model");
const mongoose_1 = __importDefault(require("mongoose"));
const post_model_1 = __importDefault(require("../post/post.model"));
const payment_utils_1 = require("../payment/payment.utils");
// const createUserIntoDB = async (payload: Pick<IUser, 'name' | 'email' | 'password'>) => {
const createUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // checking if the user is exist
    const isUserExist = yield user_model_1.User.isUserExistsByEmail(payload.email);
    if (isUserExist) {
        throw new AppError_1.default(http_status_1.default.ALREADY_REPORTED, "This user is already exist!");
    }
    const result = yield user_model_1.User.create(payload);
    return result;
});
const getAllUserFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.find();
    return result;
});
const getUserFromDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findOne({ email });
    return result;
});
const getUserByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findById(id);
    return result;
});
const updateUserProfileIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log({payload})
    const user = yield user_model_1.User.findByIdAndUpdate(payload._id, payload, {
        new: true,
        runValidators: true,
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return user;
});
const updateUserFollowersIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = new mongoose_1.default.Types.ObjectId(id);
    const followerId = new mongoose_1.default.Types.ObjectId(payload.followers);
    const user = yield user_model_1.User.findById(userId);
    const followerUser = yield user_model_1.User.findById(followerId);
    if (!user)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    if (!followerUser)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Follow User not found");
    if (!user.followers.some((id) => id.equals(followerId))) {
        user.followers.push(followerId);
        // followerUser.following = followerUser.following.filter(
        //   (followingId) => !followingId.equals(userId)
        // ); 
        followerUser.following.push(userId);
        yield user.save();
        yield followerUser.save();
    }
});
const updateFollowAndUnfollowIntoDB = (targetUserId, currentUser) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log({currentUser})
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const targetUser = yield user_model_1.User.findById(targetUserId).session(session);
        const loggedInUser = yield user_model_1.User.findById(currentUser === null || currentUser === void 0 ? void 0 : currentUser._id).session(session);
        if (!loggedInUser)
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Current user not found");
        if (!targetUser)
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Target user not found");
        const isFollowing = loggedInUser.following.some((id) => id.equals(targetUserId));
        if (!isFollowing) {
            yield user_model_1.User.findByIdAndUpdate(loggedInUser._id, { $addToSet: { following: targetUserId } }, { session });
            yield user_model_1.User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: loggedInUser._id } }, { session });
        }
        else {
            yield user_model_1.User.findByIdAndUpdate(loggedInUser._id, { $pull: { following: targetUserId } }, { session });
            yield user_model_1.User.findByIdAndUpdate(targetUserId, { $pull: { followers: loggedInUser._id } }, { session });
        }
        yield session.commitTransaction();
        session.endSession();
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const isAvailableForVerifiedIntoDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    // Return false if the user doesn't exist
    if (!user) {
        return false;
    }
    // Query 1: Find posts with upvotes that include the user
    const postsWithUserUpvoted = yield post_model_1.default.find({
        author: id,
        $expr: { $gt: [{ $size: "$upvotes" }, 0] },
        upvotes: { $elemMatch: { $eq: user._id } } // User is in the upvotes array
    });
    // If there are more than 1 post where the user has been upvoted, return true
    if (postsWithUserUpvoted.length > 1) {
        return true;
    }
    // Query 2: Find posts with upvotes but the user is not in the upvotes array
    const postsWithoutUserUpvoted = yield post_model_1.default.find({
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
});
const updateVerifiedIntoDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const upvotes = yield post_model_1.default.find({ author: id, $expr: { $gt: [{ $size: "$upvotes" }, 0] } });
    if (!upvotes) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This user have no upvote in his post");
    }
    const transactionId = `TXN-${Date.now()}`;
    // const result = await User.findByIdAndUpdate(id, {transactionId, paymentStatus:'paid'},{ new: true })
    const paymentData = {
        id: user === null || user === void 0 ? void 0 : user._id,
        transactionId,
        price: 100,
        name: user === null || user === void 0 ? void 0 : user.name,
        email: user === null || user === void 0 ? void 0 : user.email,
    };
    const paymentSession = yield (0, payment_utils_1.initiatePayment)(paymentData);
    // return result
    return { paymentSession };
});
exports.UserServices = {
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
