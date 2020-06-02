/* eslint-disable filenames/match-exported */
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

module.exports = router;

