import { MonimeClient, ClientOptions} from "./client"

export function createClient(options:ClientOptions){
    return new MonimeClient(options)
}

export { MonimeClient }
export type { ClientOptions}