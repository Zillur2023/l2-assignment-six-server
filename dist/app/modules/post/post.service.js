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
const getAllPostFromDB = (postId, userId, searchTerm, category, sortBy) => __awaiter(void 0, void 0, void 0, function* () {
    let result;
    // Initialize the aggregation pipeline
    const pipeline = [];
    // If postId is provided, fetch the specific post
    if (postId) {
        pipeline.push({ $match: { _id: new mongoose_1.default.Types.ObjectId(postId) } });
        // await Post.find({_id: postId})
    }
    else if (userId) {
        // If userId is provided, fetch posts by that user
        pipeline.push({ $match: { author: new mongoose_1.default.Types.ObjectId(userId) } });
    }
    else {
        // If searchTerm is provided, search by title (case-insensitive)
        if (searchTerm) {
            pipeline.push({
                $match: { title: { $regex: searchTerm, $options: "i" } }, // 'i' for case-insensitive
            });
        }
        // If category is provided, filter by category
        if (category) {
            pipeline.push({
                $match: { category: category },
            });
        }
    }
    // Add fields to calculate the count of upvotes and downvotes
    pipeline.push({
        $addFields: {
            upvoteCount: { $size: "$upvotes" }, // Calculate upvote count
            downvoteCount: { $size: "$downvotes" }, // Calculate downvote count
            commentCount: { $size: "$comments" }
        },
    });
    // Perform lookups for populating author, upvotes, downvotes, and comments
    pipeline.push({
        $lookup: {
            from: "users", // Collection name for authors
            localField: "author",
            foreignField: "_id",
            as: "author",
        },
    }, {
        $unwind: {
            path: "$author", // Unwind author array to get author object
            preserveNullAndEmptyArrays: true // Allow posts without an author to be returned
        }
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
            from: "comments", // Collection name for comments
            localField: "comments",
            foreignField: "_id",
            as: "comments",
        },
    });
    // Sorting options based on the sortBy parameter
    if (sortBy) {
        let sortOption = {};
        switch (sortBy) {
            case "highestUpvotes":
                sortOption = { upvoteCount: -1 }; // Sort by most upvotes (descending)
                break;
            case "lowestUpvotes":
                sortOption = { upvoteCount: 1 }; // Sort by least upvotes (ascending)
                break;
            case "highestDownvotes":
                sortOption = { downvoteCount: -1 }; // Sort by most downvotes (descending)
                break;
            case "lowestDownvotes":
                sortOption = { downvoteCount: 1 }; // Sort by least downvotes (ascending)
                break;
            default:
                sortOption = { upvoteCount: -1 }; // Default sorting
                break;
        }
        // Add sort stage to the pipeline
        pipeline.push({ $sort: sortOption });
    }
    else {
        // Default sorting by most upvotes if no sortBy is specified
        pipeline.push({ $sort: { upvoteCount: -1 } });
    }
    // Execute the aggregation pipeline
    result = yield post_model_1.default.aggregate(pipeline).exec();
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
// const isAvailableForVerifiedIntoDB = async (id: string) => {
//   const user = await User.findById(id);
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "User not found");
//   }
//   // Query 1: Find posts with upvotes that include the user
//   const postsWithUserUpvoted = await Post.find({
//     author: id,
//     // $expr: { $gt: [{ $size: "$upvotes" }, 0] },
//     // upvotes: { $elemMatch: { $eq: user._id } } 
//   }).select("upvotes");
//     // Flatten the upvotes from all posts into a single array
//     const allUpvotes = postsWithUserUpvoted.flatMap((post) => post.upvotes);
//   // If there are more than 1 post where the user has been upvoted, return true
//   // if (postsWithUserUpvoted.length > 1) {
//   //   return true;
//   // } else {
//   //   if (postsWithUserUpvoted.length > 0) {
//   //     return true
//   //   }
//   // }
//   // // Query 2: Find posts with upvotes but the user is not in the upvotes array
//   // const postsWithoutUserUpvoted = await Post.find({
//   //   author: id,
//   //   $expr: { $gt: [{ $size: "$upvotes" }, 0] },
//   //   upvotes: { $not: { $elemMatch: { $eq: user._id } } } // User is not in the upvotes array
//   // });
//   // // If there are any such posts, return true
//   // if (postsWithoutUserUpvoted.length > 0) {
//   //   return true;
//   // }
//   // Otherwise, return false
//   // return false;
//   return postsWithUserUpvoted; 
// };
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
// const getAllPostFromDB = async (postId?: string, userId?: string) => {
//   let result;
//   if (postId) {
//     // If postId is provided, fetch the specific post
//     result = await Post.find({ _id: postId })
//       .populate("author")
//       .populate("upvotes")
//       .populate("downvotes")
//       .populate("comments");
//   } else if (userId) {
//     // If userId is provided, fetch posts by that user
//     result = await Post.find({ author: userId })
//       .populate("author")
//       .populate("upvotes")
//       .populate("downvotes")
//       .populate("comments");
//   } else {
//     // If neither postId nor userId is provided, fetch all posts
//     result = await Post.find()
//       .populate("author")
//       .populate("upvotes")
//       .populate("downvotes")
//       .populate("comments");
//   }
//   return result;
// };
