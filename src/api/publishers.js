/* eslint-disable filenames/match-exported */
const publishers = require("../db/publishers");
const { Router } = require("express");
const router = new Router();

router.route("/")
	.get((req, res) => {
		publishers.getAll().then((data) => {
			res.setHeader("Content-Type", "application/json");
			res.send(JSON.stringify(data));
		});
	});

module.exports = router;
