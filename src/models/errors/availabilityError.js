module.exports = class AvailabilityError extends Error {
	constructor() {
		super("[AvailabilityError] Ressource not available");

		this.name = "AvailabilityError";
		Error.captureStackTrace(this, this.constructor);
		this.status = 410;
	}
};
