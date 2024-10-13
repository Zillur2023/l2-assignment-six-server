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
exports.verifyPayment = exports.initiatePayment = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const initiatePayment = (paymentdata) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.post(config_1.default.payment_url, {
            store_id: config_1.default.store_id,
            signature_key: config_1.default.signeture_key,
            tran_id: paymentdata.transactionId,
            // success_url: `https://assignment-four-server.vercel.app/api/v1/payment/confirmation?transactionId=${paymentdata.transactionId}&status=success`,
            // fail_url: `https://assignment-four-server.vercel.app/api/v1/payment/confirmation?status=fail`,
            // cancel_url: "https://assignment-four-client.vercel.app/",
            success_url: `${config_1.default.server_url}/api/v1/payment/confirmation?id=${paymentdata.id}&transactionId=${paymentdata.transactionId}&status=success`,
            fail_url: `${config_1.default.server_url}/api/v1/payment/confirmation?status=fail`,
            cancel_url: config_1.default.client_url,
            amount: paymentdata.price,
            currency: "BDT",
            desc: "Merchant Registration Payment",
            cus_name: paymentdata.name,
            cus_email: paymentdata.email,
            cus_add1: "N/A",
            cus_add2: "N/A",
            cus_city: "N/A",
            cus_state: "N/A",
            cus_postcode: "N/A",
            cus_country: "Bangladesh",
            cus_phone: "N/A",
            type: "json",
        });
        return response.data;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Payment initiation failed!");
    }
});
exports.initiatePayment = initiatePayment;
const verifyPayment = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(config_1.default.payment_verify_url, {
            params: {
                store_id: config_1.default.store_id,
                signature_key: config_1.default.signeture_key,
                type: "json",
                request_id: transactionId,
            },
        });
        return response.data;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Payment validation failed!");
    }
});
exports.verifyPayment = verifyPayment;
