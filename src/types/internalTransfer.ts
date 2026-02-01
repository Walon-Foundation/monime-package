import type { Pagination } from "./core";
export interface CreateInternalTransferResponse {
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

export interface ListInternalTransfersResponse {
	result: Transfer[];
	pagination: Pagination;
}

interface Transfer {
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

export interface RetrieveInternalTransferResponse {
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
