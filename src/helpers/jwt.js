const expressJwt = require("express-jwt");
const users = require("../db/users");
const config = require("../config.js");

module.exports = jwt;

function jwt() {
	const { secret } = config.jwt;
	return (...args) => {
		if (process.env.NODE_ENV === "development") { // eslint-disable-line no-process-env
			return args[2]();
		}

		return expressJwt({
			secret,
			isRevoked
		}).unless({
			path: ["/api/v1/user/login"],
			custom: (req) => {
				if (req.method !== "POST") {
					return false;
				}

				if (req.originalUrl !== "/api/v1/user") {
					return false;
				}

				return req.headers.host.startsWith("127.0.0.1");
			}
		})(...args);
	};
}

function isRevoked(req, payload, done) {
	users.find(payload.id)
		.then(() => {
			done();
		})
		.catch((error) => {
			console.error(error);
			done(null, true);
		});
}
