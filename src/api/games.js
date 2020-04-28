/* eslint-disable filenames/match-exported */
const BggAdapter = require("../models/adapters/bggAdapter");
const games = require("../db/games");
const { Router } = require("express");
const router = new Router();
const request = require("request");

router.route("/")
	.get((req, res) => {
		games.getAllGames(req.query)
			.then((data) => {
				res.setHeader("Content-Type", "application/json");
				res.send(JSON.stringify(data));
			});
	});

router.route("/:gameId")
	.get((req, res) => {
		games.getGame(req.params.gameId)
			.then((data) => {
				res.setHeader("Content-Type", "application/json");
				res.send(JSON.stringify(data));
			});
	})
	.post((req, res) => {
		request.get(`https://www.boardgamegeek.com/xmlapi2/thing?id=${req.params.gameId}`, (err, { statusCode }, body) => {
			if (!err && statusCode === 200) {
				games.register(BggAdapter.import(body))
					.then((game) => {
						if (game) {
							res.setHeader("Content-Type", "application/json");
							res.send(game);
						} else {
							res.send(JSON.stringify({
								error: new Error("Game not found"),
								code: 404
							}));
						}
					});
			} else {
				res.status(500);
				res.setHeader("Content-Type", "application/json");
				res.send(JSON.stringify({
					error: err,
					code: 500
				}));
			}
		});
	});

module.exports = router;
