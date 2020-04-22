/* eslint-disable filenames/match-exported */
const games = require("../db/games");
const { Router } = require("express");
const router = new Router();

router.route("/")
	.get((req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.send(JSON.stringify(games.getAllPublishers()));
	});

module.exports = router;
