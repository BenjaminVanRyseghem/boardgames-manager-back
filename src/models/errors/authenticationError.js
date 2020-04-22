module.exports = class AuthenticationError extends Error {
	constructor() {
		super("[AuthenticationError] Fail to login");

		this.name = "AuthenticationError";
		Error.captureStackTrace(this, this.constructor);
		this.status = 400;
	}
};
