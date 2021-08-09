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
const { join } = require("path");

let filePath = join(__dirname, "..", "..", "db", "users.json");
const adapter = new FileSync(filePath);
const db = low(adapter).then((database) => {
	database._.mixin(lodashId);
	return database.get("users");
});

// const BORROWER = "borrower";
const USER = "user";

function hasUsers() {
	return db.then((users) => !!users.value());
}

function normalize(data) {
	let result = Object.assign({}, data);
	delete result.password;
	let games = require("./games"); // eslint-disable-line global-require
	return games.countByUser(result)
		.then((count) => {
			result.numberOfBorrowedGames = count;
			return result;
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

function login(id) {
	return db
		.then((users) => users.find({ id }))
		.then((users) => users.value())
		.then((data) => {
			if (!data) {
				throw new Error("404");
			}
			return data;
		});
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

function like(id, gameId) {
	return db
		.then((database) => database.find({ id }))
		.then((database) => {
			let favorites = database.value().favorites || {};
			favorites[gameId] = true;

			return database.assign({
				favorites
			});
		})
		.then((database) => database.write());
}

function unlike(id, gameId) {
	return db
		.then((database) => database.find({ id }))
		.then((database) => {
			let favorites = database.value().favorites || {};
			delete favorites[gameId];

			return database.assign({
				favorites
			});
		})
		.then((database) => database.write());
}

function update(id, slice) {
	return db
		.then((database) => database.find({ id }))
		.then((database) => database.assign(slice))
		.then((database) => database.write());
}

function convertToRegularUser(id, email, password) {
	if (!id || !email) {
		throw new Error();
	}
	return db
		.then((database) => database.find({ id }))
		.then((database) => database.assign({
			id: email,
			password,
			role: USER
		}))
		.then((database) => database.write())
		.then(() => require("./games").convertToRegularUser(id, email)); // eslint-disable-line global-require
}

module.exports = {
	hasUsers,
	find,
	getAll,
	insert,
	update,
	convertToRegularUser,
	login,
	like,
	unlike
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
				users: []
			}))
			.then((database) => database.write());
	});
