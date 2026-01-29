import { z } from "zod";

export const createFinancialAccountSchema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  currency: z.enum(["USD", "SLE"], {
    message: "Currency must be either USD or SLE",
  }),
});
