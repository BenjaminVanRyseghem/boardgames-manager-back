/* eslint-disable filenames/match-exported,no-console */
const games = require("../db/games");
const { fetchLang } = require("./games");
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
				let promises = allGames.map((game) => new Promise((resolve, reject) => {
					if (game.lang) {
						console.log(`${game.id} already done`);
						return resolve();
					}

					return fetchLang(game.foreignId, "fr")
						.then((data) => {
							data.lang = "fr";
							resolve(games.updateRaw(game.id, data));
							console.log(`${game.id} updated`);
						})
						.catch((err) => {
							console.error(`Error while updating ${game.id}`);
							reject(err);
						});
				}));

				return Promise.all(promises);
			})
			.then(() => {
				console.log("All done");
				res.status(200).send("OK");
			})
			.catch(() => {
				res.status(500).send("KO");
			});
	});

module.exports = router;
