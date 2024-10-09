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
exports.PostServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const user_model_1 = require("../user/user.model");
const post_model_1 = __importDefault(require("./post.model"));
const createPostIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(payload.author);
    console.log({ user });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const result = yield post_model_1.default.create(payload);
    return result;
});
const updateUpvotesIntoDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield post_model_1.default.findById(id);
    if (!post) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post not found");
    }
    post.upvotes = (post.upvotes || 0) + 1;
    post.voteScore = (post.upvotes || 0) - (post.downvotes || 0);
    return yield post.save();
});
const updateDownvotesIntoDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const post = yield post_model_1.default.findById(id);
    if (!post) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post not found");
    }
    const currentVoteScore = (_a = post.voteScore) !== null && _a !== void 0 ? _a : 0; // Default to 0 if undefined
    // Check if the voteScore is greater than 0 before incrementing downvotes
    if (currentVoteScore > 0) {
        post.downvotes = (post.downvotes || 0) + 1;
        post.voteScore = (post.upvotes || 0) - post.downvotes;
    }
    return yield post.save();
});
exports.PostServices = {
    createPostIntoDB,
    updateUpvotesIntoDB,
    updateDownvotesIntoDB,
};
