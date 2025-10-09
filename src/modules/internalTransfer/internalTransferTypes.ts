export interface CreateInternalTransfer {
	success: boolean;
	messages: string[];
	result: Result;
}

interface Result {
	id: string;
	status: string;
	amount: Amount;
	sourceFinancialAccount: SourceFinancialAccount;
	destinationFinancialAccount: SourceFinancialAccount;
	financialTransactionReference: string;
	description: string;
	failureDetail: FailureDetail;
	ownershipGraph: OwnershipGraph;
	createTime: string;
	updateTime: string;
	// metadata: Metadata;
}

interface OwnershipGraph {
	owner: Owner2;
}

interface Owner2 {
	id: string;
	type: string;
	// metadata: Metadata;
	owner: Owner;
}

interface Owner {
	id: string;
	type: string;
	// metadata: Metadata;
	// owner: Metadata;
}



interface FailureDetail {
	code: string;
	message: string;
}

interface SourceFinancialAccount {
	id: string;
}

interface Amount {
	currency: string;
	value: number;
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export interface AllInternalTransfers {
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
  status: string;
  amount: Amount;
  sourceFinancialAccount: SourceFinancialAccount;
  destinationFinancialAccount: SourceFinancialAccount;
  financialTransactionReference: string;
  description: string;
  failureDetail: FailureDetail;
  ownershipGraph: OwnershipGraph;
  createTime: string;
  updateTime: string;
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


interface FailureDetail {
  code: string;
  message: string;
}

interface SourceFinancialAccount {
  id: string;
}

interface Amount {
  currency: string;
  value: number;
}


//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export interface InternalTransfer {
  success: boolean;
  messages: string[];
  result: Result;
}

interface Result {
  id: string;
  status: string;
  amount: Amount;
  sourceFinancialAccount: SourceFinancialAccount;
  destinationFinancialAccount: SourceFinancialAccount;
  financialTransactionReference: string;
  description: string;
  failureDetail: FailureDetail;
  ownershipGraph: OwnershipGraph;
  createTime: string;
  updateTime: string;
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

interface FailureDetail {
  code: string;
  message: string;
}

interface SourceFinancialAccount {
  id: string;
}

interface Amount {
  currency: string;
  value: number;
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------

export interface DeleteTransfer {
  success: boolean;
  messages: string[];
}