"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidations = void 0;
const zod_1 = require("zod");
const createUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ invalid_type_error: "Name is required" }),
        email: zod_1.z
            .string({ invalid_type_error: "Email is required" })
            .email(),
        password: zod_1.z
            .string({ invalid_type_error: "Password must be string" })
            // .min(8, "Password must be at least 8 characters long")
            .max(20, { message: "Password can not be more than 20 characters" }),
        phone: zod_1.z.string({ invalid_type_error: "Phone number is required" }),
        role: zod_1.z.enum(["admin", "user"]),
        address: zod_1.z.string({ invalid_type_error: "Address is required" }),
    }),
});
exports.userValidations = {
    createUserValidationSchema,
};
