export interface CreatePayout {
	success: boolean;
	messages: string[];
	result: Result;
}

interface Result {
	id: string;
	status: string;
	amount: Amount;
	source: Source;
	destination: Destination;
	fees: Fee[];
	failureDetail: FailureDetail;
	createTime: string;
	updateTime: string;
	ownershipGraph: OwnershipGraph;
	metadata: Metadata;
}

interface OwnershipGraph {
	owner: Owner2;
}

interface Owner2 {
	id: string;
	type: string;
	metadata: Metadata;
	owner: Owner;
}

interface Owner {
	id: string;
	type: string;
	metadata: Metadata;
	owner: Metadata;
}

interface FailureDetail {
	code: string;
	message: string;
}

interface Fee {
	code: string;
	amount: Amount;
	metadata: Metadata;
}

type Metadata = {};

interface Destination {
	type: string;
	providerId: string;
	accountNumber: string;
	transactionReference: string;
}

interface Source {
	financialAccountId: string;
	transactionReference: string;
}

interface Amount {
	currency: string;
	value: number;
}
