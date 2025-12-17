import type { MonimeClient } from "../../client";
import { createUssdOtp } from "./ussdOtp";
import type { CreateUssdOtpRequest } from "./ussdOtpTypes";

export function UssdOtpAPI(client: MonimeClient) {
	return {
		create: (body: CreateUssdOtpRequest) => createUssdOtp(body, client),
	};
}
