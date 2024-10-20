import { model, Schema } from "mongoose";
import { IPost } from "./post.interface";

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    isPremium: { type: Boolean, default: false },
    image: { type: String },
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    voteScore: { type: Number, default: 0 },
    comments:[{ type: Schema.Types.ObjectId, ref: "Comment", default: [] }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Post = model<IPost>("Post", PostSchema);

export default Post;
