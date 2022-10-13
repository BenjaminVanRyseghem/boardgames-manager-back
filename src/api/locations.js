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
			games.findInLocation(req.params.locationId, req.user.id)
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
	.put((req, res) => {
		if (req.user.role !== "admin") {
			res.status(401).send("{}");
			return;
		}

		let promises = [
			locations.update(req.params.locationId, req.body),
			games.findInLocation(req.params.locationId, req.user.id)
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
		if (req.user.role !== "admin") {
			res.status(401).send("{}");
			return;
		}

		games.findInLocation(req.params.locationId, req.user.id)
			.then((allGames) => Promise.all(allGames.map((game) => games.update(
				{
					...game,
					location: "1"
				},
				req.user.id
			))))
			.then(() => locations.remove({
				id: req.params.locationId
			}))
			.then((location) => {
				res.setHeader("Content-Type", "application/json");
				res.send(location);
			});
	});

module.exports = router;
