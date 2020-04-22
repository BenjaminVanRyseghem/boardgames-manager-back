/* eslint-disable filenames/match-exported */
const users = require("../db/users");
const { Router } = require("express");
const router = new Router();

router.route("/hasUsers")
	.get((req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.send(JSON.stringify(users.hasUsers()));
	});

module.exports = router;

