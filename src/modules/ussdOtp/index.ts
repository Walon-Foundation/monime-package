import type { ClientConfig, Result } from "../../types";
import { createUssdOtp } from "./ussdOtp";
import type {
	CreateUssdOtpRequest,
	CreateUssdOtpResponse,
} from "./ussdOtpTypes";

export function UssdOtpAPI(config: ClientConfig) {
	return {
		create: (body: CreateUssdOtpRequest) =>
			createUssdOtp(body, config) as Promise<Result<CreateUssdOtpResponse>>,
	};
}
