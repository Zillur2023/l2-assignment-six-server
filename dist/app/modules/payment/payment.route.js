"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const router = (0, express_1.Router)();
router.post('/confirmation', payment_controller_1.paymentControllers.createPayment);
exports.PaymentRoutes = router;
