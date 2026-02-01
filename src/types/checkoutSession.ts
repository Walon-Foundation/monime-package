import type { Pagination } from "./core";

export interface ListCheckoutsResponse {
	result: CheckoutSession[];
	Pagination: Pagination;
}

interface CheckoutSession {
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

export interface RetrieveCheckoutResponse {
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

export interface CreateCheckoutResponse {
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
