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
			});
	});

module.exports = router;
