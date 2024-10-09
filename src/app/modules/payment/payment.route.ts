import { Router } from "express";
import { paymentControllers } from "./payment.controller";

const router = Router()

router.post('/confirmation', paymentControllers.createPayment)

export const PaymentRoutes = router