import { z } from "zod";

export const createPayoutSchema = z.object({
  amount: z.number().gt(0, "Amount must be greater than 0"),
  sourceAccount: z.string().min(1, "Source account cannot be empty"),
  destination: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("momo"),
      providerId: z.enum(["m17", "m18"]),
      phoneNumber: z.string(),
    }),
    z.object({
      type: z.literal("bank"),
      providerId: z.enum(["b01", "b02", "b03"]),
      accountNumber: z.string(),
    }),
    z.object({
      type: z.literal("wallet"),
      providerId: z.enum(["w01", "w02"]),
      walletId: z.string(),
    }),
  ]),
});
