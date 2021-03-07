/* eslint-disable filenames/match-exported */
const games = require("../db/games");
const request = require("request");
const BggAdapter = require("../models/adapters/bggAdapter");
const { Router } = require("express");
const router = new Router();

router.route("/")
	.get((req, res) => {
		if (req.user.role !== "admin") {
			res.status(401).send("{}");
			return;
		}

		games.getAllGames({}, req.user.id)
			.then((allGames) => {
				let promises = allGames.map((game) => new Promise((resolve) => {
					request.get(`https://www.boardgamegeek.com/xmlapi2/thing?id=${game.foreignId}&stats=1`, (err, { statusCode }, body) => {
						if (!err && statusCode === 200) {
							let updatedData = BggAdapter.import(body, "alternate", game.name);
							let { from, complexity } = updatedData;

							resolve(games.updateRaw(game.id, {
								from,
								complexity
							}));
						} else {
							console.error(`Failed to update ${game.name}`);
							resolve();
						}
					});
				}));

				return Promise.all(promises);
			})
			.then(() => {
				res.status(200).send("OK");
			});
	});

module.exports = router;
