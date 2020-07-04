/* eslint-disable filenames/match-exported */
const games = require("../db/games");
const locations = require("../db/locations");
const { Router } = require("express");
const router = new Router();

router.route("/")
	.get((req, res) => {
		locations.getAll().then((data) => {
			res.setHeader("Content-Type", "application/json");
			res.send(JSON.stringify(data));
		});
	})
	.post((req, res) => {
		locations.insert({
			name: req.body.name
		}).then((location) => {
			res.send(location);
		});
	});

router.route("/:locationId")
	.get((req, res) => {
		let promises = [
			locations.find(req.params.locationId),
			games.findInLocation(req.params.locationId)
		];

		Promise.all(promises)
			.then(([location, gamesInLocation]) => {
				let data = {
					...location,
					games: gamesInLocation
				};

				res.setHeader("Content-Type", "application/json");
				res.send(JSON.stringify(data));
			})
			.catch(() => {
				res.status(404).send("{}");
			});
	})
	.delete((req, res) => {
		locations.remove({
			id: req.params.locationId
		}).then((game) => {
			res.setHeader("Content-Type", "application/json");
			res.send(game);
		});
	});

module.exports = router;
