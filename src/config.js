/* eslint-disable no-process-env */
const config = {
	environment: process.env.NODE_ENV || "dev",
	server: {
		port: process.env.PORT || 80,
		sslPort: process.env.SSL_PORT || 443
	},
	jwt: {
		secret: process.env.JWT_SECRET,
		saltRounds: +process.env.SALT_ROUNDS || 10
	}
};

module.exports = config;
