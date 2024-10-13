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
exports.paymentServices = void 0;
const path_1 = require("path");
const payment_utils_1 = require("./payment.utils");
const fs_1 = require("fs");
const config_1 = __importDefault(require("../../config"));
const user_model_1 = require("../user/user.model");
// Helper function to read the HTML template safely
const readTemplate = (filePath) => {
    try {
        return (0, fs_1.readFileSync)(filePath, 'utf-8');
    }
    catch (error) {
        console.error(`Error reading the HTML template: ${error}`);
        throw new Error("Template not found");
    }
};
// Main function to handle payment processing and template rendering
const createPaymentIntoDB = (id, transactionId, status) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("createPaymentIntoDB-->id", id, transactionId);
    let message;
    let statusClass;
    try {
        // Verify payment status
        const verifyResponse = yield (0, payment_utils_1.verifyPayment)(transactionId);
        console.log({ verifyResponse });
        if (verifyResponse && verifyResponse.pay_status === "Successful") {
            // Update booking status
            yield user_model_1.User.findByIdAndUpdate(id, {
                isVerified: true,
                transactionId,
                paymentStatus: "Paid",
            }, { new: true });
            message = "Successfully Paid!";
            statusClass = "message-success"; // Success class
        }
        else {
            message = "Payment Failed!";
            statusClass = "message-failure"; // Failure class
        }
        // Load the HTML template
        const filePath = (0, path_1.join)(__dirname, '../../../views/confirmation.html');
        //   console.log({filePath})
        let template = readTemplate(filePath);
        //   console.log({template})
        // Replace placeholders in the HTML template
        template = template.replace('{{message}}', message);
        template = template.replace('{{status}}', statusClass); // Add status class
        template = template.replace('{{clientUrl}}', config_1.default.client_url); // Add client URL
        return template;
    }
    catch (error) {
        console.error(`Error in createPaymentIntoDB: ${error}`);
        throw new Error("Payment processing failed");
    }
});
exports.paymentServices = {
    createPaymentIntoDB,
};
