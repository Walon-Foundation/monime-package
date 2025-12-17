import type { ClientConfig } from "../../types";
import { createUssdOtp } from "./ussdOtp";
import type { CreateUssdOtpRequest } from "./ussdOtpTypes";

export function UssdOtpAPI(config: ClientConfig) {
	return {
		create: (body: CreateUssdOtpRequest) => createUssdOtp(body, config),
	};
}
