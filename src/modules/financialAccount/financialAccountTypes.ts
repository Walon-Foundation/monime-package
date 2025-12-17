export interface CreateFinancialAccount {
	id: string;
	uvan: string;
	name: string;
	currency: string;
	reference: string;
	description: string;
	balance: Balance;
	createTime: string;
	updateTime: string;
	// metadata: any;
}



interface Balance {
	available: Available;
}

interface Available {
	currency: string;
	value: number;
}

//------------------------------------------------------------------------------------------------------

export interface GetFinancialAccount {
	id: string;
	uvan: string;
	name: string;
	currency: string;
	reference: string;
	description: string;
	balance: Balance;
	createTime: string;
	updateTime: string;
	// metadata: Metadata;
}



interface Balance {
	available: Available;
}

interface Available {
	currency: string;
	value: number;
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export interface AllFinancialAccount {
	result: FinancialAccount[];
	pagination: Pagination;
}

interface Pagination {
	count: number;
	next: string;
}

interface FinancialAccount {
	id: string;
	uvan: string;
	name: string;
	currency: string;
	reference: string;
	description: string;
	balance: Balance;
	createTime: string;
	updateTime: string;
	//   metadata: Metadata;
}

interface Balance {
	available: Available;
}

interface Available {
	currency: string;
	value: number;
}
