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
const updateUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
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
const updateUserFolloweringIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log({ payload });
    const userId = new mongoose_1.default.Types.ObjectId(payload._id);
    const followingId = new mongoose_1.default.Types.ObjectId(id);
    const user = yield user_model_1.User.findById(userId);
    const followingUser = yield user_model_1.User.findById(followingId);
    if (!user)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    if (!followingUser)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Following User not found");
    if (!user.following.some((id) => id.equals(followingId))) {
        user.following.push(followingId);
        followingUser.followers.push(userId);
        yield user.save();
        yield followingUser.save();
    }
    else {
        user.following = user.following.filter((followeringId) => !followeringId.equals(followingId));
        console.log('user.following', user.following);
        followingUser.followers = followingUser.followers.filter((followerId) => !followerId.equals(userId));
        yield user.save();
        yield followingUser.save();
    }
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
    updateUserIntoDB,
    updateUserFollowersIntoDB,
    updateUserFolloweringIntoDB,
    updateVerifiedIntoDB
};
