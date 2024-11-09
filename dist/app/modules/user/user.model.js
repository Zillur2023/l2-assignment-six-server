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
exports.User = exports.userSchema = void 0;
const mongoose_1 = require("mongoose");
// import { TUser, UserModel } from "./user.interface";
const config_1 = __importDefault(require("../../config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.userSchema = new mongoose_1.Schema(
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
    followers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: [] }],
    following: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: [] }],
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
}, { timestamps: true });
exports.userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this; // doc
        // hashing password and save into DB
        user.password = yield bcrypt_1.default.hash(user.password, Number(config_1.default.bcrypt_salt_rounds));
        next();
    });
});
// set '' after saving password
exports.userSchema.post("save", function (doc, next) {
    doc.password = "";
    next();
});
exports.userSchema.statics.isPasswordMatched = function (plainTextPassword, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(plainTextPassword, hashedPassword);
    });
};
exports.userSchema.statics.isJWTIssuedBeforePasswordChanged = function (passwordChangedTimestamp, jwtIssuedTimestamp) {
    const passwordChangedTime = new Date(passwordChangedTimestamp).getTime() / 1000;
    return passwordChangedTime > jwtIssuedTimestamp;
};
exports.User = (0, mongoose_1.model)("User", exports.userSchema);
