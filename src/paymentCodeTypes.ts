export interface CreatePaymentCode {
  success: boolean;
  messages: string[];
  result: Result;
}

interface Result {
  id: string;
  mode: string;
  status: string;
  name: string;
  amount: {
    currency:string,
    value:number
  };
  enable: boolean;
  expireTime: string;
  customer: {
    name:string
  };
  ussdCode: string;
  reference: string;
  authorizedProviders: string[];
  authorizedPhoneNumber: string;
  recurrentPaymentTarget: {
    expectedPaymentCount: number;
    expectedPaymentTotal: {
        currency:string;
        value:number
    };
  };
  financialAccountId: string;
  processedPaymentData: ProcessedPaymentData;
  createTime: string;
  updateTime: string;
  ownershipGraph: OwnershipGraph;
  metadata: {};
}

interface OwnershipGraph {
  owner: {
    id: string;
  type: string;
  metadata: {};
  owner: {
    id: string;
    type: string;
    metadata: {};
    owner: {};
    }
  };
}

interface ProcessedPaymentData {
  amount: {
    currency:string,
    value:number
  };
  orderId: string;
  paymentId: string;
  orderNumber: string;
  channelData: {
    providerId: string;
    accountId: string;
    reference: string;
  };
  financialTransactionReference: string;
  metadata: {};
}

//--------------------------------------------------------------------------------

export interface DeletePaymentCode {
    success:boolean,
    messages: [any]
}