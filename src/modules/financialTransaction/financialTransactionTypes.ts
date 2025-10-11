export interface GetTransaction {
  success: boolean;
  messages: string[];
  result: Result;
}

interface Result {
  id: string;
  type: string;
  amount: Amount;
  timestamp: string;
  reference: string;
  financialAccount: FinancialAccount;
  originatingReversal: OriginatingReversal;
  originatingFee: OriginatingFee;
  ownershipGraph: OwnershipGraph;
//   metadata: Metadata;
}

interface OwnershipGraph {
  owner: Owner2;
}

interface Owner2 {
  id: string;
  type: string;
//   metadata: Metadata;
  owner: Owner;
}

interface Owner {
  id: string;
  type: string;
//   metadata: Metadata;
//   owner: Metadata;
}


interface OriginatingFee {
  code: string;
}

interface OriginatingReversal {
  originTxnId: string;
  originTxnRef: string;
}

interface FinancialAccount {
  id: string;
  balance: Balance;
}

interface Balance {
  after: Amount;
}

interface Amount {
  currency: string;
  value: number;
}



//-----------------------------------------------------------------------------------------------------------------------------------------
export interface AllTransaction {
  success: boolean;
  messages: string[];
  result: Result[];
  pagination: Pagination;
}

interface Pagination {
  count: number;
  next: string;
}

interface Result {
  id: string;
  type: string;
  amount: Amount;
  timestamp: string;
  reference: string;
  financialAccount: FinancialAccount;
  originatingReversal: OriginatingReversal;
  originatingFee: OriginatingFee;
  ownershipGraph: OwnershipGraph;
//   metadata: Metadata;
}

interface OwnershipGraph {
  owner: Owner2;
}

interface Owner2 {
  id: string;
  type: string;
//   metadata: Metadata;
  owner: Owner;
}

interface Owner {
  id: string;
  type: string;
//   metadata: Metadata;
//   owner: Metadata;
}

interface OriginatingFee {
  code: string;
}

interface OriginatingReversal {
  originTxnId: string;
  originTxnRef: string;
}

interface FinancialAccount {
  id: string;
  balance: Balance;
}

interface Balance {
  after: Amount;
}

interface Amount {
  currency: string;
  value: number;
}