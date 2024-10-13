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
exports.PostServices = exports.updateCommentIntoDB = exports.updateDownvotesIntoDB = exports.updateUpvotesIntoDB = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const user_model_1 = require("../user/user.model");
const post_model_1 = __importDefault(require("./post.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const createPostIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(payload.author);
    console.log({ user });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const result = yield post_model_1.default.create(payload);
    return result;
});
const getAllPostFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let result;
    if (id) {
        result = yield post_model_1.default.find({ _id: id }).populate("author").populate("comments");
    }
    else {
        result = yield post_model_1.default.find().populate("author").populate("comments");
    }
    return result;
});
const updateUpvotesIntoDB = (userId, postId) => __awaiter(void 0, void 0, void 0, function* () {
    const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
    const postObjectId = new mongoose_1.default.Types.ObjectId(postId);
    // Find the post by its ID
    const post = yield post_model_1.default.findById(postObjectId);
    if (!post) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post not found");
    }
    if (!post.upvotes) {
        post.upvotes = [];
    }
    if (!post.downvotes) {
        post.downvotes = [];
    }
    // Check if the user has already upvoted
    const hasUpvoted = post.upvotes.some((upvoteId) => upvoteId.equals(userObjectId));
    // Check if the user has already downvoted (they should not be allowed to upvote if so)
    const hasDownvoted = post.downvotes.some((downvoteId) => downvoteId.equals(userObjectId));
    if (hasDownvoted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You cannot upvote after downvoting. Remove downvote first.");
    }
    if (hasUpvoted) {
        // If already upvoted, remove the upvote
        yield post_model_1.default.findByIdAndUpdate(postObjectId, { $pull: { upvotes: userObjectId } }, { new: true });
    }
    else {
        // Add the upvote
        yield post_model_1.default.findByIdAndUpdate(postObjectId, { $addToSet: { upvotes: userObjectId } }, { new: true });
    }
    return post_model_1.default.findById(postObjectId); // Return the updated post
});
exports.updateUpvotesIntoDB = updateUpvotesIntoDB;
const updateDownvotesIntoDB = (userId, postId) => __awaiter(void 0, void 0, void 0, function* () {
    const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
    const postObjectId = new mongoose_1.default.Types.ObjectId(postId);
    // Find the post by its ID
    const post = yield post_model_1.default.findById(postObjectId);
    if (!post) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post not found");
    }
    if (!post.upvotes) {
        post.upvotes = [];
    }
    if (!post.downvotes) {
        post.downvotes = [];
    }
    // Check if the user has already downvoted
    const hasDownvoted = post.downvotes.some((downvoteId) => downvoteId.equals(userObjectId));
    // Check if the user has already upvoted (they should not be allowed to downvote if so)
    const hasUpvoted = post.upvotes.some((upvoteId) => upvoteId.equals(userObjectId));
    if (hasUpvoted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You cannot downvote after upvoting. Remove upvote first.");
    }
    if (hasDownvoted) {
        // If already downvoted, remove the downvote
        yield post_model_1.default.findByIdAndUpdate(postObjectId, { $pull: { downvotes: userObjectId } }, { new: true });
    }
    else {
        // Add the downvote
        yield post_model_1.default.findByIdAndUpdate(postObjectId, { $addToSet: { downvotes: userObjectId } }, { new: true });
    }
    return post_model_1.default.findById(postObjectId); // Return the updated post
});
exports.updateDownvotesIntoDB = updateDownvotesIntoDB;
const updateCommentIntoDB = (userId, postId) => __awaiter(void 0, void 0, void 0, function* () {
    const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
    const postObjectId = new mongoose_1.default.Types.ObjectId(postId);
    // Find the user by its ID
    const user = yield user_model_1.User.findById(userObjectId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    // Find the post by its ID
    const post = yield post_model_1.default.findById(postObjectId);
    if (!post) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post not found");
    }
    if (user && post) {
        // Add the upvote
        yield post_model_1.default.findByIdAndUpdate(postObjectId, { $addToSet: { comment: userObjectId } }, { new: true });
    }
    return post_model_1.default.findById(postObjectId); // Return the updated post
});
exports.updateCommentIntoDB = updateCommentIntoDB;
const updatePostIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_model_1.default.findByIdAndUpdate(payload._id, payload, {
        new: true,
        runValidators: true,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post not found");
    }
    return result;
});
exports.PostServices = {
    createPostIntoDB,
    getAllPostFromDB,
    updateUpvotesIntoDB: exports.updateUpvotesIntoDB,
    updateDownvotesIntoDB: exports.updateDownvotesIntoDB,
    updatePostIntoDB,
    updateCommentIntoDB: exports.updateCommentIntoDB
};
