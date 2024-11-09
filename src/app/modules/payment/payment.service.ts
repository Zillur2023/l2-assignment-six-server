import { join } from "path";
import { verifyPayment } from "./payment.utils";
import { readFileSync } from "fs";
import config from "../../config";
import { User } from "../user/user.model";

// Helper function to read the HTML template safely
const readTemplate = (filePath: string): string => {
  try {
      return readFileSync(filePath, 'utf-8');
  } catch (error) {
      console.error(`Error reading the HTML template: ${error}`);
      throw new Error("Template not found");
  }
};

// Main function to handle payment processing and template rendering
const createPaymentIntoDB = async (id: string, transactionId:string, status: string): Promise<string> => {
    let message: string;
  let statusClass: string;

  try {
      // Verify payment status
      const verifyResponse = await verifyPayment(transactionId);

      if (verifyResponse && verifyResponse.pay_status === "Successful") {
          // Update booking status
          await User.findByIdAndUpdate(
              id ,
              {
                  isVerified: true,
                  transactionId,
                  paymentStatus: "Paid",
              },
              {new: true}
          );
          message = "Successfully Paid!";
          statusClass = "message-success"; // Success class
      } else {
          message = "Payment Failed!";
          statusClass = "message-failure"; // Failure class
      }

      // Load the HTML template
    //   const filePath = join(__dirname, '../../../views/confirmation.html');
      const filePath = join(__dirname, '../../../../public/confirmation.html');
      let template = readTemplate(filePath);

      // Replace placeholders in the HTML template
      template = template.replace('{{message}}', message);
      template = template.replace('{{status}}', statusClass); // Add status class
      template = template.replace('{{clientUrl}}', config.client_url as string); // Add client URL

      return template;

  } catch (error) {
      console.error(`Error in createPaymentIntoDB: ${error}`);
      throw new Error("Payment processing failed");
  }
};

export const paymentServices = {
  createPaymentIntoDB,
};