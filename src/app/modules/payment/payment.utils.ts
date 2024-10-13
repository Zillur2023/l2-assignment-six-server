import axios from "axios";
import config from "../../config";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";


export const initiatePayment = async (paymentdata: any) => {
 try {
  const response = await axios.post(config.payment_url as string, {
    store_id: config.store_id,
    signature_key: config.signeture_key,
    tran_id: paymentdata.transactionId,
    // success_url: `https://assignment-four-server.vercel.app/api/v1/payment/confirmation?transactionId=${paymentdata.transactionId}&status=success`,
    // fail_url: `https://assignment-four-server.vercel.app/api/v1/payment/confirmation?status=fail`,
    // cancel_url: "https://assignment-four-client.vercel.app/",
    success_url: `${config.server_url}/api/v1/payment/confirmation?id=${paymentdata.id}&transactionId=${paymentdata.transactionId}&status=success`,
    fail_url: `${config.server_url}/api/v1/payment/confirmation?status=fail`,
    cancel_url: config.client_url,
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
  
 } catch (error) {
  throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Payment initiation failed!")
 }
};

export const verifyPayment = async (transactionId: string) => {
 try {
  const response = await axios.get(config.payment_verify_url!, {
    params: {
      store_id: config.store_id,
      signature_key: config.signeture_key,
      type: "json",
      request_id: transactionId,
    },
  });

  return response.data
 } catch (error) {
  throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Payment validation failed!")
 }
};
