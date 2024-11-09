import { model, Schema } from "mongoose";
import { IPost } from "./post.interface";

const PostSchema = new Schema<IPost>(
  {
    title: { type: String},
    content: { type: String},
    category: { type: String },
    isPremium: { type: Boolean },
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
