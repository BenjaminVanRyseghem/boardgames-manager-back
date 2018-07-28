let games = require("../db/games");

module.exports = (router) => {
	router.route("/publishers")
		.get((req, res) => {
			res.setHeader("Content-Type", "application/json");
			res.send(JSON.stringify(games.getAllPublishers()));
		});
};
