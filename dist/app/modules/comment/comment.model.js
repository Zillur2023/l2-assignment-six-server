"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    postId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    commentText: { type: String, required: true },
    parentCommentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Comment', default: null }, // For nested replies
}, { timestamps: true });
const Comment = (0, mongoose_1.model)("Comment", CommentSchema);
exports.default = Comment;
