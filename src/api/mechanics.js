/* eslint-disable filenames/match-exported */
const mechanics = require("../db/mechanics");
const { Router } = require("express");
const router = new Router();

router.route("/")
	.get((req, res) => {
		mechanics.getAll().then((data) => {
			res.setHeader("Content-Type", "application/json");
			res.send(JSON.stringify(data));
		});
	});

module.exports = router;

