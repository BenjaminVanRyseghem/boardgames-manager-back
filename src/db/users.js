/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - name
 *          - email
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *            format: email
 *            description: Email for the user, needs to be unique.
 *        example:
 *           name: Alexander
 *           email: fake@email.com
 *      HasUsers:
 *        type: object
 *        required:
 *          - hasUsers
 *        properties:
 *          hasUsers:
 *            type: boolean
 *        example:
 *          hasUsers: true
 */

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileAsync");
const lodashId = require("lodash-id");

const adapter = new FileSync("./users.json");
const db = low(adapter).then((database) => {
	database._.mixin(lodashId);
	return database.get("users");
});

const BORROWER = "borrower";

function hasUsers() {
	return db.then((users) => !!users.value());
}

function normalize(data) {
	let games = require("./games");
	return games.countByUser(data)
		.then((count) => {
			data.numberOfBorrowedGames = count;
			return data;
		});
}

function find(id) {
	return db
		.then((users) => users.find({ id }))
		.then((users) => users.value())
		.then((data) => {
			if (!data) {
				throw new Error("404");
			}
			return data;
		})
		.then((data) => normalize(data));
}

function getAll() {
	return db
		.then((data) => data.value())
		.then((data) => Promise.all(data.map((datum) => normalize(datum))));
}

function insert(data) {
	return db
		.then((database) => database.insert(data))
		.then((database) => database.write());
}

module.exports = {
	hasUsers,
	find,
	getAll,
	insert
};

db
	.then((users) => users.value())
	.then((users) => {
		if (!users) {
			throw new Error("Empty DB");
		}
	})
	.catch(() => {
		low(adapter)
			.then((database) => database.defaults({
				users: [
					{
						id: "12",
						lastName: "Sebastien",
						firstName: "Julien",
						role: BORROWER

					},
					{
						id: "27",
						lastName: "Lagniez",
						firstName: "Jonathan",
						role: BORROWER

					}
				]
			}))
			.then((database) => database.write());
	});
