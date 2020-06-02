/* eslint-disable filenames/match-exported */
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

module.exports = router;
