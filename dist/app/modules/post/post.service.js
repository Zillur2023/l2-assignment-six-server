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
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const result = yield post_model_1.default.create(payload);
    return result;
});
const deleteUnassociatedPosts = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Step 1: Get all user IDs and all post IDs
        const allUserIds = yield user_model_1.User.find({ isDeleted: false }).select('_id').lean(); // Get all user IDs
        const allPostIds = yield post_model_1.default.find().select('_id author').lean(); // Get all post IDs with their authors
        // Extract user IDs from the array of user objects
        const userIds = allUserIds.map(user => user._id.toString()); // Convert ObjectId to string for comparison
        // Step 2: Filter posts that do not have an associated user ID
        const postIdsToDelete = allPostIds
            .filter(post => !userIds.includes(String(post === null || post === void 0 ? void 0 : post.author))) // Keep posts without a valid user
            .map(post => post._id); // Get the IDs of those posts
        // Step 3: Delete the unassociated posts
        if (postIdsToDelete.length > 0) {
            yield post_model_1.default.deleteMany({ _id: { $in: postIdsToDelete } });
        }
        else {
        }
    }
    catch (error) {
        console.error('Error deleting unassociated posts:', error);
    }
});
const getAllPostFromDB = (postId, userId, searchTerm, category, sortBy, isPremium // New parameter to specify premium filter
) => __awaiter(void 0, void 0, void 0, function* () {
    yield deleteUnassociatedPosts(); // Delete posts without associated users
    let result;
    const pipeline = [];
    // if (!isPremium) {
    //   pipeline.push({ $match: { isPremium: { $ne: true } } });
    // }
    if (!postId && !isPremium) {
        pipeline.push({ $match: { isPremium: { $ne: true } } });
    }
    if (postId) {
        // If postId is provided, fetch the specific post
        pipeline.push({ $match: { _id: new mongoose_1.default.Types.ObjectId(postId) } });
    }
    else if (userId) {
        // If userId is provided, fetch posts by that user
        pipeline.push({ $match: { author: new mongoose_1.default.Types.ObjectId(userId) } });
    }
    else {
        // If searchTerm is provided, search by title (case-insensitive)
        if (searchTerm) {
            pipeline.push({
                $match: {
                    $or: [
                        { title: { $regex: searchTerm, $options: "i" } },
                        { category: { $regex: searchTerm, $options: "i" } },
                        { content: { $regex: searchTerm, $options: "i" } }
                    ]
                }
            });
        }
        // If category is provided, filter by category
        if (category) {
            pipeline.push({
                $match: { category: category },
            });
        }
    }
    // Lookup stages for author and comments
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
        },
    }, {
        $unwind: {
            path: "$author",
            preserveNullAndEmptyArrays: true,
        },
    }, {
        $lookup: {
            from: "users", // Collection name for upvotes
            localField: "upvotes",
            foreignField: "_id",
            as: "upvotes",
        },
    }, {
        $lookup: {
            from: "users", // Collection name for downvotes
            localField: "downvotes",
            foreignField: "_id",
            as: "downvotes",
        },
    }, {
        $lookup: {
            from: "comments",
            localField: "comments",
            foreignField: "_id",
            as: "comments",
        },
    });
    // Execute the aggregation pipeline to get all posts
    result = yield post_model_1.default.aggregate(pipeline).exec();
    // Sorting based on upvotes and downvotes after fetching
    if (sortBy) {
        result.sort((a, b) => {
            const upvoteCountA = a.upvotes ? a.upvotes.length : 0;
            const upvoteCountB = b.upvotes ? b.upvotes.length : 0;
            const downvoteCountA = a.downvotes ? a.downvotes.length : 0;
            const downvoteCountB = b.downvotes ? b.downvotes.length : 0;
            switch (sortBy) {
                case "highestUpvotes":
                    return upvoteCountB - upvoteCountA; // Sort descending
                case "lowestUpvotes":
                    return upvoteCountA - upvoteCountB; // Sort ascending
                case "highestDownvotes":
                    return downvoteCountB - downvoteCountA; // Sort descending
                case "lowestDownvotes":
                    return downvoteCountA - downvoteCountB; // Sort ascending
                default:
                    return 0;
            }
        });
    }
    else {
        // Default sort by highest upvotes if no sort option is provided
        result.sort((a, b) => {
            const upvoteCountA = a.upvotes ? a.upvotes.length : 0;
            const upvoteCountB = b.upvotes ? b.upvotes.length : 0;
            return upvoteCountB - upvoteCountA; // Sort by upvotes descending
        });
    }
    return result;
});
const updateUpvotesIntoDB = (userId, postId) => __awaiter(void 0, void 0, void 0, function* () {
    const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
    const postObjectId = new mongoose_1.default.Types.ObjectId(postId);
    // Find the user by its ID
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
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
        yield post_model_1.default.findByIdAndUpdate(postObjectId, { $pull: { downvotes: userObjectId } }, { new: true });
    }
    else {
        if (hasUpvoted) {
            // If already upvoted, remove the upvote
            yield post_model_1.default.findByIdAndUpdate(postObjectId, { $pull: { upvotes: userObjectId } }, { new: true });
        }
        else {
            // Add the upvote
            yield post_model_1.default.findByIdAndUpdate(postObjectId, { $addToSet: { upvotes: userObjectId } }, { new: true });
        }
    }
    return post_model_1.default.findById(postObjectId); // Return the updated post
});
exports.updateUpvotesIntoDB = updateUpvotesIntoDB;
const updateDownvotesIntoDB = (userId, postId) => __awaiter(void 0, void 0, void 0, function* () {
    const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
    const postObjectId = new mongoose_1.default.Types.ObjectId(postId);
    // Find the user by its ID
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
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
        // throw new AppError(httpStatus.FORBIDDEN, "You cannot downvote after upvoting. Remove upvote first.");
        yield post_model_1.default.findByIdAndUpdate(postObjectId, { $pull: { upvotes: userObjectId } }, { new: true });
    }
    else {
        if (hasDownvoted) {
            // If already downvoted, remove the downvote
            yield post_model_1.default.findByIdAndUpdate(postObjectId, { $pull: { downvotes: userObjectId } }, { new: true });
        }
        else {
            // Add the downvote
            yield post_model_1.default.findByIdAndUpdate(postObjectId, { $addToSet: { downvotes: userObjectId } }, { new: true });
        }
    }
    return post_model_1.default.findById(postObjectId); // Return the updated post
});
exports.updateDownvotesIntoDB = updateDownvotesIntoDB;
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
const deletePostFromDB = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_model_1.default.findByIdAndDelete(postId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post not found");
    }
    return result;
});
const isAvailableForVerifiedIntoDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    // Fetch posts by author ID that have upvotes
    const postsWithUserUpvoted = yield post_model_1.default.find({ author: id, upvotes: { $exists: true, $ne: [] } } // Ensuring posts have upvotes
    ).select("upvotes");
    // Flatten and filter the upvotes to check if the user has upvoted any post
    const userUpvotes = postsWithUserUpvoted
        .flatMap(post => post.upvotes) // Flatten upvotes from all posts
        .filter(upvote => !(upvote === null || upvote === void 0 ? void 0 : upvote.equals(user._id))); // Filter for the user's upvotes
    return userUpvotes;
});
exports.PostServices = {
    createPostIntoDB,
    getAllPostFromDB,
    updateUpvotesIntoDB: exports.updateUpvotesIntoDB,
    updateDownvotesIntoDB: exports.updateDownvotesIntoDB,
    updatePostIntoDB,
    updateCommentIntoDB: exports.updateCommentIntoDB,
    deletePostFromDB,
    isAvailableForVerifiedIntoDB
};
