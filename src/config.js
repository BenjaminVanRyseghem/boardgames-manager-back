/* eslint-disable no-process-env */
const config = {
	environment: process.env.NODE_ENV || "dev",
	server: {
		port: process.env.PORT || 8080
	},
	jwt: {
		secret: process.env.JWT_SECRET,
		saltRounds: +process.env.SALT_ROUNDS || 10
	}
};

module.exports = config;
