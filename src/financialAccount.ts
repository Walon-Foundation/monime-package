import axios  from "axios";
import { randomBytes } from "crypto"
import { CreateFinancialAccount, GetFinancialAccount } from "./financialAccountTypes";

const URL = 'https://api.monime.io/v1/financial-accounts'
const value = randomBytes(20).toString("hex")

interface createFinancialAccountReturn {
    data?:CreateFinancialAccount,
    error?:Error
    success:boolean
}

export async function createFinancialAccount(accountName:string, monime_space_id:string, monime_access_token:string):Promise<createFinancialAccountReturn>{
    const body = {
        name:accountName,
        currency:'SLE',
        description:"",
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

        const data = res.data as CreateFinancialAccount

        return { success:true, data}
    }catch(error){
        if(axios.isAxiosError(error)){
            return { error:error, success:false}
        }

        return { error:new Error("unknown error"), success:false}
    }
}



interface GetFinancialAccountReturn {
    data?:GetFinancialAccount
    error?:Error
    success:boolean
}

export async function getFinancialAccount(financialAccountId:string, monime_access_token:string, monime_space_id:string):Promise<GetFinancialAccountReturn>{
    try{
        const res = await axios.get(`${URL}/${financialAccountId}`, {
            headers:{
                'Monime-Space-Id': `${monime_space_id}`,
                Authorization: `Bearer ${monime_access_token}`, 
            }
        })

        const data = res.data as GetFinancialAccount

        return { success:true, data}
    }catch(error){
        if(axios.isAxiosError(error)){
            return { error:error, success:false}
        }

        return { error:new Error("unknown error"), success:false}
    }
}

