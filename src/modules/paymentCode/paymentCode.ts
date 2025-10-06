import axios  from "axios";
import { randomBytes } from "crypto"
import { CreatePaymentCode, DeletePaymentCode } from "./paymentCodeTypes";
import { MonimeClient } from "../../client";

const value = randomBytes(20).toString("hex")
const URL = "https://api.monime.io/v1/payment-codes"

interface Return {
    data?:CreatePaymentCode,
    error?:Error
    success:boolean
}

export async function createPaymentCode(paymentName:string, amount:number, financialAccountId:string |null, name:string, phoneNumber:string, client:MonimeClient):Promise<Return>{
    let financialAccount = null
    if(financialAccountId !== ""){
        financialAccount = financialAccountId
    }

    const { accessToken, monimeSpaceId} = client.getConfig()


    const bodyData = {
        name: `${paymentName}`,
        mode: "recurrent",
        enable:true,
        amount: {
        currency: "SLE",
        value:(amount) * 100
        },
        duration: "1h30m",
        customer: {
        name: `${name}`,
        },
        reference:"",
        authorizedPhoneNumber:phoneNumber,
        // authorizedProviders: ["m17", "m18"],
        recurrentPaymentTarget:{
        expectedPaymentCount: 1,
        expectedPaymentTotal:{
            currency:"SLE",
            value:(amount) * 100
        }
        },
        financialAccountId:financialAccount,
        metadata: {}
    };

    try{
        const res = await axios.post(URL, bodyData, {
            headers:{
                'Idempotency-Key': `${value}`,
                'Monime-Space-Id': `${monimeSpaceId}`,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'  
            }
        })

        const data = res.data as CreatePaymentCode
        return { data:data, success:true}
    }catch(error){
        if(axios.isAxiosError(error)){
            return {error:error.response?.data, success:false}
        }
        return {error:new Error("unknown error"), success:false}
    }
}


export async function deletePaymentCode(paymentCodeId:string, client:MonimeClient):Promise<Return>{
    const { accessToken, monimeSpaceId} = client.getConfig()
    
    try{
        const res = await axios.delete(`${URL}/${paymentCodeId}`, {
            headers:{
                'Idempotency-Key': `${value}`,
                'Monime-Space-Id': `${monimeSpaceId}`,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'  
            }
        })

        const data = res.data as DeletePaymentCode
        if(!data.success){
            return { error:new Error("delete failed"), success:false}
        }

        return { success:true }
    }catch(error){
        if(axios.isAxiosError(error)){
            return { error:error, success:false}
        }
        return { error:new Error("unknown error"), success:false}
    }
}