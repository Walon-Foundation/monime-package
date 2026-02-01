import { type ClientOptions, MonimeClient } from "./client";

export * from "./types";

export function createClient(options: ClientOptions) {
	return new MonimeClient(options);
}

export { MonimeClient };
export type { ClientOptions };
export * from "./error";
