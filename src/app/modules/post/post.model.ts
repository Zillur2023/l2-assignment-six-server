import { model, Schema } from "mongoose";
import { IPost } from "./post.interface";

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    isPremium: { type: Boolean, default: false },
    imageUrl: { type: String },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voteScore: { type: Number, default: 0 }, 
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Post = model<IPost>("Post", PostSchema);

export default Post;
