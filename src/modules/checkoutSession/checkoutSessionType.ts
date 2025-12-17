export interface AllCheckout {
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
	name: string;
	orderNumber: string;
	reference: string;
	description: string;
	redirectUrl: string;
	cancelUrl: string;
	successUrl: string;
	lineItems: LineItems;
	financialAccountId: string;
	brandingOptions: BrandingOptions;
	expireTime: string;
	createTime: string;
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

interface BrandingOptions {
	primaryColor: string;
}

interface LineItems {
	data: Datum[];
}

interface Datum {
	type: string;
	id: string;
	name: string;
	price: Price;
	quantity: number;
	reference: string;
	description: string;
	images: string[];
}

interface Price {
	currency: string;
	value: number;
}

//---------------------------------------------------------------------------------------------

export interface OneCheckout {
	success: boolean;
	messages: string[];
	result: Result;
}

interface Result {
	id: string;
	status: string;
	name: string;
	orderNumber: string;
	reference: string;
	description: string;
	redirectUrl: string;
	cancelUrl: string;
	successUrl: string;
	lineItems: LineItems;
	financialAccountId: string;
	brandingOptions: BrandingOptions;
	expireTime: string;
	createTime: string;
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

interface BrandingOptions {
	primaryColor: string;
}

interface LineItems {
	data: Datum[];
}

interface Datum {
	type: string;
	id: string;
	name: string;
	price: Price;
	quantity: number;
	reference: string;
	description: string;
	images: string[];
}

interface Price {
	currency: string;
	value: number;
}

//-------------------------------------------------------------------------------------------------

export interface CreateCheckout {
	success: boolean;
	messages: string[];
	result: Result;
}

interface Result {
	id: string;
	status: string;
	name: string;
	orderNumber: string;
	reference: string;
	description: string;
	redirectUrl: string;
	cancelUrl: string;
	successUrl: string;
	lineItems: LineItems;
	financialAccountId: string;
	brandingOptions: BrandingOptions;
	expireTime: string;
	createTime: string;
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

interface BrandingOptions {
	primaryColor: string;
}

interface LineItems {
	data: Datum[];
}

interface Datum {
	type: string;
	id: string;
	name: string;
	price: Price;
	quantity: number;
	reference: string;
	description: string;
	images: string[];
}

interface Price {
	currency: string;
	value: number;
}
