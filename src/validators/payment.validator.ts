import { z } from "zod";

export const patchPaymentSchema = z.record(z.string(), z.unknown());
