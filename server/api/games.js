let games = require("../db/games");

module.exports = (router) => {
	router.route("/games")
		.get((req, res) => {
			res.setHeader("Content-Type", "application/json");
			res.send(JSON.stringify(games.getAllGames(req.query)));
		});

	router.route("/games/:game_id")
		.get((req, res) => {
			res.send(req.params.game_id);
		});
};
