
import catchAsync from "../../utils/catchAsync";
import { paymentServices } from "./payment.service";

const createPayment = catchAsync(async (req, res) => {
  const { transactionId, status } = req.query;
  const result = await paymentServices.createPaymentIntoDB(
    transactionId as string, status as string
  );
  res.send(result);
});

export const paymentControllers = {
  createPayment,
};
