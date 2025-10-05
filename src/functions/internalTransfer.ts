import axios from "axios";
import { randomBytes } from "crypto";
import { CreateInternalTransfer } from "./internalTransferTypes";

const URL = 'https://api.monime.io/v1/internal-transfers';
const value = randomBytes(20).toString("hex")

interface Return {
    data?:CreateInternalTransfer,
    error?:Error
    success:boolean
}

export async function createInternalTransfer(sourceAccount:string, destinationAccount:string, monime_access_token:string, monime_space_id:string, value:number):Promise<Return>{
    const body = {
        amount :{
            currency:"SLE",
            value:value
        },
        sourceFinancialAccount:{
            id:sourceAccount
        },
        destinationFinancialAccount:{
            id:destinationAccount,
        },
        metadata:{}
    }
    try{
        const res = await axios.post(URL, body, {
            headers:{
                'Idempotency-Key': `${value}`,
                'Monime-Space-Id': `${monime_space_id}`,
                Authorization: `Bearer ${monime_access_token}`,
                'Content-Type': 'application/json'  
            }
        })

        const data = res.data as CreateInternalTransfer

        return { success:true, data}
    }catch(error){
        if(axios.isAxiosError(error)){
            return {error:error, success:false}
        }

        return {error:new Error("unkknown error"), success:false}
    }
}