/* eslint-disable filenames/match-exported */
const fetch = require("node-fetch");
const games = require("../db/games");
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
					if (!game.picture) {
						resolve();
						return;
					}
					if (game.picture.match("700x700")) {
						resolve();
						return;
					}

					let [_, picId] = game.picture.match(/pic(\d+)\./);

					fetch(`https://api.geekdo.com/api/images/${picId}`)
						.then((body) => body.json())
						.then((body) => {
							if (!body) {
								resolve();
								return;
							}
							let picture = body.images.itempage.url;
							resolve(games.updateRaw(game.id, {
								picture
							}));
						});
				}));

				return Promise.all(promises);
			})
			.then(() => {
				res.status(200).send("OK");
			})
			.catch(() => {
				res.status(500).send("KO");
			});
	});

module.exports = router;
