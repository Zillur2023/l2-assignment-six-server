"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PostSchema = new mongoose_1.Schema({
    title: { type: String },
    content: { type: String },
    category: { type: String },
    isPremium: { type: Boolean },
    image: { type: String },
    upvotes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: [] }],
    downvotes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: [] }],
    voteScore: { type: Number, default: 0 },
    comments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Comment", default: [] }],
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
const Post = (0, mongoose_1.model)("Post", PostSchema);
exports.default = Post;
