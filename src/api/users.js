/* eslint-disable filenames/match-exported */
const games = require("../db/games");
const users = require("../db/users");
const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config").jwt;
const AuthenticationError = require("../models/errors/authenticationError");

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
	})
	.post((req, res) => bcrypt.hash(req.body.password, config.saltRounds)
		.then((hash) => users.insert({
			id: req.body.email,
			password: hash,
			role: "user"
		}))
		.then(() => res.send(JSON.stringify({
			id: req.body.email
		}))));

router.route("/login")
	.post((req, res) => {
		users.find(req.body.username)
			.then((user) => {
				if (!user || !bcrypt.compareSync(req.body.password, user.password)) { // eslint-disable-line no-sync
					throw new AuthenticationError();
				}

				let userWithoutHash = { ...user };
				delete userWithoutHash.password;

				const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 12000 });

				res.setHeader("Content-Type", "application/json");
				res.send(JSON.stringify({
					...userWithoutHash,
					token
				}));
			})
			.catch((error) => {
				res.sendStatus(404);
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

