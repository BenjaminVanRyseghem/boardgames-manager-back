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
		users.login(req.body.username)
			.then((user) => {
				if (!user || !bcrypt.compareSync(req.body.password, user.password)) { // eslint-disable-line no-sync
					throw new AuthenticationError();
				}

				let userWithoutHash = { ...user };
				delete userWithoutHash.password;

				const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: "7d" });

				res.setHeader("Content-Type", "application/json");
				res.send(JSON.stringify({
					...userWithoutHash,
					token
				}));
			})
			.catch(() => res.sendStatus(404));
	});

function findUser(id, res) {
	let promises = [
		users.find(id),
		games.findByUser(id)
	];

	return Promise.all(promises)
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
}

router.route("/:id")
	.get((req, res) => findUser(req.params.id, res))
	.put((req, res) => {
		users.find(req.params.id)
			.then((user) => {
				if (!user) {
					throw new AuthenticationError();
				}

				users.update(req.params.id, {
					firstName: req.body.firstName || user.firstName,
					lastName: req.body.lastName || user.lastName
				})
					.then(() => findUser(req.params.id, res));
			})
			.catch(() => res.status(401).send("{}"));
	});

router.route("/:id/name")
	.put((req, res) => {
		if (req.params.id !== req.user.id) {
			res.status(401).send("{}");
			return;
		}

		users.find(req.params.id)
			.then((user) => {
				if (!user) { // eslint-disable-line no-sync
					throw new AuthenticationError();
				}

				users.update(req.params.id, {
					firstName: req.body.firstName || user.firstName,
					lastName: req.body.lastName || user.lastName
				})
					.then(() => findUser(req.params.id, res));
			})
			.catch(() => res.status(401).send("{}"));
	});
router.route("/:id/password")
	.put((req, res) => {
		if (req.params.id !== req.user.id) {
			res.status(401).send("{}");
			return;
		}

		users.login(req.params.id)
			.then((user) => {
				if (!user || !bcrypt.compareSync(req.body.currentPassword, user.password)) { // eslint-disable-line no-sync
					throw new AuthenticationError();
				}

				bcrypt.hash(req.body.newPassword, config.saltRounds)
					.then((hash) => {
						user.password = hash;
						return users.update(req.params.id, { password: hash });
					})
					.then(() => {
						res.status(200).send("{\"message\": \"OK\"}");
					});
			})
			.catch(() => res.status(401).send("{}"));
	});

router.route("/convertToRegularUser")
	.post((req, res) => {
		bcrypt.hash(req.body.password, config.saltRounds)
			.then((password) => {
				users.convertToRegularUser(req.body.id, req.body.email, password)
					.then(() => findUser(req.body.email, res))
					.catch(() => res.status(401).send("{}"));
			});
	});

module.exports = router;

