export interface LoginFormData {
	email: string;
	password: string;
	rememberMe: boolean;
}

export interface LoginFormValidationError {
	field: string;
	message: string;
}
