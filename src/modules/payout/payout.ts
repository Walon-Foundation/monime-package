import axios from "axios"
import { randomBytes } from "crypto"
import { CreatePayout } from "./payoutTypes"
import { MonimeClient } from "../../client"

const URL = ""
const value = randomBytes(20).toString("hex")

interface Return {
    data?:CreatePayout,
    error?:Error,
    success:boolean
}

export async function CreatePayoutMobileMoney(amount:number,phoneNumber:string, sourceAccount:string, client:MonimeClient):Promise<Return> {
    let provider = "m17"
    const africell = ["077", "033", "088", "080","090","030"]
    for (let value of africell){
        if(phoneNumber.startsWith(value)){
            provider = 'm18'
            break;
        }
    }

    const { accessToken, monimeSpaceId} = client._getConfig()

    const body = {
        amount:{
            currency:'SLE',
            value:amount
        },
        source:{
            financialAccountId:sourceAccount
        },
        destination:{
            type:"momo",
            provider:provider,
            phoneNumber:phoneNumber
        },
        metadata:{}
    }

    try{
        const res = await axios.post(URL, body, {
            headers:{
                'Idempotency-Key': `${value}`,
                'Monime-Space-Id': `${monimeSpaceId}`,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'  
            }
        })

        const data = res.data as CreatePayout

        return {success:true, data}
    }catch(error){
        if(axios.isAxiosError(error)){
            return { success:false, error:error}
        }

        return { success:false, error: new Error("unknown error")}
    }   
}