import { z } from "zod";

export const createPaymentCodeSchema = z.object({
  paymentName: z.string().min(1, "Payment name is required"),
  amount: z.number().gt(0, "Amount must be greater than zero"),
  financialAccountId: z.string().optional().nullable(),
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
});
