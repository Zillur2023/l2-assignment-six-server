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
exports.CommentServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const post_model_1 = __importDefault(require("../post/post.model"));
const comment_model_1 = __importDefault(require("./comment.model"));
const user_model_1 = require("../user/user.model");
const createCommentIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield post_model_1.default.findById(payload.postId);
    if (!post) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post not found");
    }
    const user = yield user_model_1.User.findById(payload.userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const comment = yield comment_model_1.default.create(payload);
    if (user && post) {
        // Add the upvote
        yield post_model_1.default.findByIdAndUpdate(payload.postId, { $addToSet: { comments: comment === null || comment === void 0 ? void 0 : comment._id } }, { new: true });
    }
    return yield comment_model_1.default.find();
});
const getAllCommentFromDB = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield comment_model_1.default.find({ postId }).populate("userId").sort({ createdAt: -1 });
    // const result = await Comment.find().populate("userId").sort({ createdAt: -1 }); 
    // const result = await Comment.aggregate([
    //   { $match: { postId } },
    //   {
    //     $lookup: {
    //       from: "posts",
    //       localField: "postId",
    //       foreignField: "_id",
    //       as: "postId",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "users", // Collection name for upvotes
    //       localField: "userId",
    //       foreignField: "_id",
    //       as: "userId",
    //     },
    //   },
    // ]).exec();
    return result;
});
const updateCommentIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield comment_model_1.default.findByIdAndUpdate(payload._id, { $set: payload }, // Use $set to specify the fields to update
    {
        new: true, // Return the updated document
        runValidators: true, // Ensure validation rules are followed
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Comment not found");
    }
});
const deleteCommentIntoDB = (commentId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield comment_model_1.default.findByIdAndDelete(commentId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Comment not found");
    }
    return result;
});
exports.CommentServices = {
    createCommentIntoDB,
    getAllCommentFromDB,
    updateCommentIntoDB,
    deleteCommentIntoDB
};
