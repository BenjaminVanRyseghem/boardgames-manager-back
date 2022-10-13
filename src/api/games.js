/* eslint-disable filenames/match-exported */
/* eslint max-lines: [2, 350] */
const { parse } = require("node-html-parser");
const BggAdapter = require("../models/adapters/bggAdapter");
const games = require("../db/games");
const he = require("he");
const random = require("random");
const fetch = require("node-fetch");
const { Router } = require("express");
const router = new Router();
const xml2json = require("xml2json");

const versionsConvert = {
	en: /multilingual|english/i,
	fr: /multilingual|french/i
};

const descriptionEmpty = "This page does not exist. You can edit this page to create it.";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

function registerGame({ gameData, location, currentUserId, res }) {
	games.register(
		gameData,
		location,
		currentUserId
	)
		.then((game) => {
			if (game) {
				res.setHeader("Content-Type", "application/json");
				res.send(game);
			} else {
				res.status(404).send(JSON.stringify({
					error: new Error("Game not found"),
					code: 404
				}));
			}
		});
}

function findGame(id, currentUserId, res) {
	return games.getGame(id, currentUserId)
		.then((game) => {
			if (game) {
				res.setHeader("Content-Type", "application/json");
				res.send(game);
			} else {
				res.status(404).send(JSON.stringify({
					error: new Error("Game not found"),
					code: 404
				}));
			}
		});
}

function fetchPicture(imageId) {
	if (!imageId) {
		return Promise.resolve(null);
	}
	return fetch(`https://api.geekdo.com/api/images/${imageId}`)
		.then((body) => body.json())
		.then((body) => {
			if (!body) {
				return null;
			}

			return body.images.itempage.url;
		});
}

function fetchVersion(version) {
	let { id: versionId } = version;
	if (!versionId) {
		return Promise.resolve(version);
	}
	return new Promise((resolve, reject) => fetch(`https://boardgamegeek.com/boardgameversion/${versionId}`)
		.then((body) => body.text())
		.then((body) => { // eslint-disable-line max-statements
			let result = {};

			if (!body) {
				resolve(result);
				return;
			}

			let root = parse(body);
			let desc = root.querySelector("#editdesc");

			if (desc) {
				let description = desc.innerText.trim();
				if (description !== descriptionEmpty) {
					result.description = he.decode(description);
				}
			}

			let nameNode = root.querySelector("#edit_linkednameid");
			if (nameNode) {
				result.name = he.decode(nameNode.innerText.trim());
			}

			let img = root.querySelector(".mt5 a");

			if (!img) {
				resolve(result);
				return;
			}

			let match = img.getAttribute("href").match(/\/image\/(\d+).*/);
			let [, imageId] = match;

			fetchPicture(imageId)
				.then((pictureUrl) => {
					if (!pictureUrl) {
						resolve(result);
						return;
					}

					result.picture = pictureUrl;
					resolve(result);
				})
				.catch((err) => {
					reject(new Error(err));
				});
		}));
}

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
	})
	.post((req, res) => {
		if (req.user.role !== "admin") {
			res.status(401).send("{}");
			return;
		}

		let { gameId, location, version } = req.body;
		fetch(`https://www.boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`)
			.then((body) => body.text())
			.then((body) => {
				let data = BggAdapter.import(xml2json.toJson(body, { object: true }));

				data.lang = version.lang || "en";
				fetchVersion(version)
					.then((versionData) => {
						let gameData = Object.assign({}, data, versionData);
						registerGame({
							gameData,
							location,
							currentUserId: req.user.id,
							res
						});
					});
			})
			.catch((err) => {
				res.status(500);
				res.setHeader("Content-Type", "application/json");
				res.send(JSON.stringify({
					error: err,
					code: 500
				}));
			});
	});

router.route("/random")
	.get((req, res) => games.getAllGames({ showExpansions: 0 }, req.user.id)
		.then((allGames) => { // eslint-disable-line max-statements
			if (!allGames.length) {
				res.status(200).send(JSON.stringify({ id: -1 }));
				return;
			}

			let foundGame = null;
			if (req.session.lastRandom) {
				let filteredGames = allGames.filter((game) => game.id !== req.session.lastRandom);
				let { length } = filteredGames;
				let index = random.int(0, length - 1);
				foundGame = filteredGames[index];
			} else {
				let { length } = allGames;
				let index = random.int(0, length - 1);
				foundGame = allGames[index];
			}

			if (!foundGame) {
				res.status(200).send(JSON.stringify({ id: -1 }));
				return;
			}

			let { id } = foundGame;
			req.session.lastRandom = id;
			res.status(200).send(JSON.stringify({ id }));
		}));

router.route("/versions/:gameId/:lang")
	.get((req, res) => {
		let { lang, gameId } = req.params;
		fetch(`https://www.boardgamegeek.com/xmlapi/boardgame/${gameId}?stats=1`)
			.then((body) => body.text())
			.then((body) => {
				let data = xml2json.toJson(body, { object: true });
				let versions = data.boardgames.boardgame.boardgameversion;
				let defaultPicture = data.boardgames.boardgame.thumbnail;

				if (!versions) {
					return [
						{
							picture: data.boardgames.boardgame.thumbnail,
							lang
						}
					];
				}

				if (versions.constructor !== Array) {
					versions = [versions];
				}

				let candidates = versions.filter((each) => each.$t.match(versionsConvert[lang]));

				if (!candidates.length) {
					return [
						{
							picture: data.boardgames.boardgame.thumbnail,
							lang
						}
					];
				}

				let promises = candidates.map((candidate) => fetch(`https://boardgamegeek.com/boardgameversion/${candidate.objectid}`)
					.then((html) => html.text())
					.then((html) => {
						let root = parse(html);
						let img = root.querySelector(".mt5 a img");

						return {
							name: candidate.$t,
							id: candidate.objectid,
							picture: img ? img.getAttribute("src") : defaultPicture,
							lang
						};
					}));

				return Promise.all(promises);
			})
			.then((candidates) => {
				res
					.status(200)
					.send(JSON.stringify(candidates));
			});
	});

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
				res.status(404).send(JSON.stringify({
					error: new Error("Game not found"),
					code: 404
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
