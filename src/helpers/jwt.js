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
			path: ["/api/v1/user/login"]
		})(...args);
	};
}

function isRevoked(req, payload, done) {
	const user = users.findUser(payload.sub);

	// revoke token if user no longer exists
	if (!user.length) {
		done(null, true);
		return;
	}

	done();
}
