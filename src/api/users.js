/* eslint-disable filenames/match-exported */
const games = require("../db/games");
const users = require("../db/users");
const { Router } = require("express");
const router = new Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * path:
 *  /user/hasUsers:
 *    get:
 *      summary: Used to know if any user exists
 *      responses:
 *        "200":
 *          description: A boolean
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/HasUsers'
 */
router.route("/hasUsers")
	.get((req, res) => {
		users.hasUsers()
			.then((hasUsers) => {
				res.setHeader("Content-Type", "application/json");
				res.send(JSON.stringify({
					hasUsers
				}));
			});
	});

router.route("/")
	.get((req, res) => {
		users.getAll().then((data) => {
			res.setHeader("Content-Type", "application/json");
			res.send(JSON.stringify(data));
		});
	});

router.route("/:id")
	.get((req, res) => {
		let promises = [
			users.find(req.params.id),
			games.findByUser(req.params.id)
		];

		Promise.all(promises)
			.then(([user, gamesByUser]) => {
				let data = {
					...user,
					borrowedGames: gamesByUser
				};

				res.setHeader("Content-Type", "application/json");
				res.send(JSON.stringify(data));
			})
			.catch(() => {
				res.status(404).send("{}");
			});
	});

module.exports = router;

