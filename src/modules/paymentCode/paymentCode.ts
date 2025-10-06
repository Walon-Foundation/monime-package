import axios  from "axios";
import { randomBytes } from "crypto"
import { CreatePaymentCode, DeletePaymentCode } from "./paymentCodeTypes";

const value = randomBytes(20).toString("hex")
const URL = "https://api.monime.io/v1/payment-codes"

interface Return {
    code?:string,
    error?:Error
    success:boolean
}

export async function createPaymentCode(paymentName:string, amount:number, financialAccountId:string |null, name:string, phoneNumber:string, monime_access_token:string, monime_space_id:string):Promise<Return>{
    let financialAccount = null
    if(financialAccountId !== ""){
        financialAccount = financialAccountId
    }

    if(monime_access_token === "" || monime_space_id === ""){
        console.log("monime_access_token or monime_space_id is required")
        return {error:new Error("monime_access_token and monime_space_id is required"), success:false}
    }


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
                'Monime-Space-Id': `${monime_space_id}`,
                Authorization: `Bearer ${monime_access_token}`,
                'Content-Type': 'application/json'  
            }
        })

        const data = res.data as CreatePaymentCode
        return { code:data.result.ussdCode, success:true}
    }catch(error){
        if(axios.isAxiosError(error)){
            return {error:error.response?.data, success:false}
        }
        return {error:new Error("unknown error"), success:false}
    }
}


export async function deletePaymentCode(paymentCodeId:string, monime_access_token:string, monime_space_id:string):Promise<Return>{
    try{
        const res = await axios.delete(`${URL}/${paymentCodeId}`, {
            headers:{
                'Idempotency-Key': `${value}`,
                'Monime-Space-Id': `${monime_space_id}`,
                Authorization: `Bearer ${monime_access_token}`,
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