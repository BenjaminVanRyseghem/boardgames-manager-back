/* eslint-disable filenames/match-exported */
const BggAdapter = require("../models/adapters/bggAdapter");
const games = require("../db/games");
const request = require("request");
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
 *  /game:
 *    get:
 *      summary: Get all games matching the query
 *      responses:
 *        "200":
 *          description: A list of games
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Games'
 */
router.route("/")
	.get((req, res) => {
		games.getAllGames(req.query, req.user.id)
			.then((data) => {
				res.setHeader("Content-Type", "application/json");
				res.send(JSON.stringify(data));
			});
	});

function findGame(id, currentUserId, res) {
	return games.getGame(id, currentUserId)
		.then((game) => {
			if (game) {
				res.setHeader("Content-Type", "application/json");
				res.send(game);
			} else {
				res.send(JSON.stringify({
					error: new Error("Game not found"),
					code: 404
				}));
			}
		});
}

router.route("/:gameId")
	.get((req, res) => findGame(req.params.gameId, req.user.id, res))
	.put((req, res) => {
		if (req.user.role !== "admin") {
			res.status(401).send("{}");
			return;
		}

		games.update(
			{
				...req.body,
				id: req.params.gameId
			},
			req.user.id
		).then((game) => {
			if (game) {
				res.setHeader("Content-Type", "application/json");
				res.send(game);
			} else {
				res.send(JSON.stringify({
					error: new Error("Game not found"),
					code: 404
				}));
			}
		});
	})
	.post((req, res) => {
		if (req.user.role !== "admin") {
			res.status(401).send("{}");
			return;
		}

		request.get(`https://www.boardgamegeek.com/xmlapi2/thing?id=${req.params.gameId}&stats=1`, (err, { statusCode }, body) => {
			if (!err && statusCode === 200) {
				games.register(
					BggAdapter.import(body, req.body.nameType || "primary", req.body.name),
					req.body.location,
					req.user.id
				)
					.then((game) => {
						if (game) {
							res.setHeader("Content-Type", "application/json");
							res.send(game);
						} else {
							res.send(JSON.stringify({
								error: new Error("Game not found"),
								code: 404
							}));
						}
					});
			} else {
				res.status(500);
				res.setHeader("Content-Type", "application/json");
				res.send(JSON.stringify({
					error: err,
					code: 500
				}));
			}
		});
	})
	.delete((req, res) => {
		games.deleteGame({
			id: req.params.gameId
		}).then((game) => {
			res.setHeader("Content-Type", "application/json");
			res.send(game);
		});
	});

router.route("/:gameId/like")
	.post((req, res) => {
		if (req.body.like) {
			require("../db/users").like(req.user.id, req.params.gameId) // eslint-disable-line global-require
				.then(() => findGame(req.params.gameId, req.user.id, res));
		} else {
			require("../db/users").unlike(req.user.id, req.params.gameId) // eslint-disable-line global-require
				.then(() => findGame(req.params.gameId, req.user.id, res));
		}
	});

module.exports = router;
