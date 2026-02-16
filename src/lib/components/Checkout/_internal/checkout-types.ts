// ====================================================================
// Validation
// ====================================================================

export interface CheckoutValidationError {
	field: string;
	message: string;
}

// ====================================================================
// Steps / Progress
// ====================================================================

export interface CheckoutStep {
	/** Unique step identifier (e.g., "review", "shipping", "confirm", "complete") */
	id: string;
	/** Display label — used as fallback when no t() is provided */
	label: string;
	/** Whether this step can be navigated to (clicked). Default: true for past steps */
	navigable?: boolean;
}

// ====================================================================
// Address
// ====================================================================

export interface CheckoutAddressData {
	name: string;
	street: string;
	city: string;
	postal_code: string;
	country: string;
	phone?: string;
	label?: string;
	is_default?: boolean;
}

// ====================================================================
// Customer / Guest Form
// ====================================================================

export interface CheckoutCustomerFormData {
	email: string;
	first_name: string;
	last_name: string;
	phone: string;
	company_name: string;
	tax_id: string;
	vat_number: string;
}

// ====================================================================
// Login Form
// ====================================================================

export interface CheckoutLoginFormData {
	email: string;
	password: string;
	rememberMe: boolean;
}

// ====================================================================
// Order Line Item
// ====================================================================

export interface CheckoutOrderLineItem {
	product_id: string;
	sku?: string;
	name: string;
	/** Price in smallest currency unit (e.g., cents) */
	price: number;
	quantity: number;
}

// ====================================================================
// Order Totals
// ====================================================================

export interface CheckoutOrderTotals {
	/** Sum of line items (cents) */
	subtotal: number;
	/** Tax amount (cents) */
	tax: number;
	/** Shipping cost (cents) */
	shipping: number;
	/** Discount amount (cents) */
	discount: number;
	/** Grand total (cents) */
	total: number;
}

// ====================================================================
// Delivery Option (available for selection)
// ====================================================================

export interface CheckoutDeliveryOption {
	id: string;
	name: string;
	description?: string;
	/** Price in cents */
	price: number;
	estimated_time?: string;
	is_active: boolean;
	sort_order: number;
	/** Minimum order amount to qualify (cents) */
	min_order_amount?: number;
	/** Free shipping threshold (cents) — shipping is free when subtotal >= this value */
	free_above?: number;
}

// ====================================================================
// Delivery Snapshot (as stored on a placed order)
// ====================================================================

export interface CheckoutDeliverySnapshot {
	id: string;
	name: string;
	price: number;
	estimated_time?: string;
}

// ====================================================================
// Order Data (simplified order representation)
// ====================================================================

export interface CheckoutOrderData {
	status: string;
	items: CheckoutOrderLineItem[];
	currency?: string;
	totals: CheckoutOrderTotals;
	shipping_address?: CheckoutAddressData;
	billing_address?: CheckoutAddressData;
	delivery_option_id?: string;
	delivery_option?: CheckoutDeliverySnapshot;
	customer_email?: string;
	checkout_stage?: string;
}
