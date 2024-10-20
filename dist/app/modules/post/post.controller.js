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
exports.PostControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const post_service_1 = require("./post.service");
const createPost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield post_service_1.PostServices.createPostIntoDB(Object.assign(Object.assign({}, JSON.parse(req.body.data)), { image: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path }));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Create post successfully',
        data: result
    });
}));
const getAllPost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, userId } = req.params; // Retrieve ids from URL parameters
    // Retrieve posts based on postId or userId
    const result = yield post_service_1.PostServices.getAllPostFromDB(postId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Get all posts successfully',
        data: result,
    });
}));
const updateUpvotes = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId, postId } = req.body;
    const result = yield post_service_1.PostServices.updateUpvotesIntoDB(userId, postId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Upvotes update successfully',
        data: result
    });
}));
const updateDownvotes = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId, postId } = req.body;
    const result = yield post_service_1.PostServices.updateDownvotesIntoDB(userId, postId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Downvotes update successfully',
        data: result
    });
}));
const updatePost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield post_service_1.PostServices.updatePostIntoDB(Object.assign(Object.assign({}, JSON.parse(req.body.data)), { image: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path }));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Post update successfully',
        data: result
    });
}));
const updateComment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, postId } = req.body;
    const result = yield post_service_1.PostServices.updateCommentIntoDB(userId, postId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Comment update successfully',
        data: result
    });
}));
const deletePost = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    const result = yield post_service_1.PostServices.deletePostFromDB(postId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Post deleted successfully',
        data: result
    });
}));
const isAvailableForVerified = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield post_service_1.PostServices.isAvailableForVerifiedIntoDB(id);
    // console.log("isAvailableForVerified --result",result)
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Available for verified successfully',
        data: result,
    });
}));
exports.PostControllers = {
    createPost,
    getAllPost,
    updateUpvotes,
    updateDownvotes,
    updatePost,
    updateComment,
    deletePost,
    isAvailableForVerified
};
