import { Schema, model } from "mongoose";
// import { TUser, UserModel } from "./user.interface";
import config from "../../config";
import bcrypt from "bcrypt";
import { IUser, IUserModel } from "./user.interface";

export const userSchema = new Schema<IUser, IUserModel>(
  // const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    needsPasswordChange: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
    },
    bio: { type: String },
    image: { type: String },
    followers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    following: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    isVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["admin", "user"],
      required: true,
      default: "user",
    },
    status: {
      type: String,
      enum: ["in-progress", "blocked"],
      // default: "in-progress",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      // default: "Pending"
    },
    transactionId: {
      type: String,
      //  default: ""
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this; // doc
  // hashing password and save into DB
  user.password = await bcrypt.hash(
    user.password as string,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

// set '' after saving password
userSchema.post("save", function (doc, next) {
  doc.password = "";
  next();
});

<<<<<<< HEAD

=======
>>>>>>> 47887c9c5d66776b87d3bff15332eac8f84e7ab0
userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const User = model<IUser, IUserModel>("User", userSchema);
