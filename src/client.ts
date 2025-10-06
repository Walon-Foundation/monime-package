import { createFinancialAccount,getFinancialAccount } from "./modules/financialAccount/financialAccount"
import { CreateFinancialAccount, GetFinancialAccount } from "./modules/types"

export interface ClientOptions {
    monimeSpaceeId:string,
    accessToken:string
}

export class MonimeClient {
    private monimeSpaceId:string
    private accessToken:string

    /* Methods */

    //method for financial accounts
    createFinancialAccount: (name:string ) => Promise<{success:boolean, data?:CreateFinancialAccount, error?:Error}>
    getFinancialAccount: (id: string) => Promise<{ success: boolean; data?: GetFinancialAccount; error?: Error }>

    constructor(options:ClientOptions){
        this.accessToken = options.accessToken
        this.monimeSpaceId = options.monimeSpaceeId

        this.createFinancialAccount = (name:string) => createFinancialAccount(name, this)
        this.getFinancialAccount = (id) => getFinancialAccount(id, this)
    }

    getConfig(){
        return {
            monimeSpaceId :this.monimeSpaceId,
            accessToken:this.accessToken
        }
    }
}