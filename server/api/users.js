let users = require("../db/users");

module.exports = (router) => {
	router.route("/hasUsers")
		.get((req, res) => {
			res.setHeader("Content-Type", "application/json");
			res.send(JSON.stringify(users.hasUsers()));
		});
};
