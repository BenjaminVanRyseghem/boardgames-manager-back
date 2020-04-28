/* eslint-disable filenames/match-exported */
const categories = require("../db/categories");
const { Router } = require("express");
const router = new Router();

router.route("/")
	.get((req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.send(JSON.stringify(categories.getAll()));
	});

module.exports = router;

