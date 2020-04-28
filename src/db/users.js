const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileAsync");
const lodashId = require("lodash-id");

const adapter = new FileSync("./users.json");
const db = low(adapter).then((database) => {
	database._.mixin(lodashId);
	return database.get("users");
});

const BORROWER = Symbol("borrower");

function hasUsers() {
	return db.then((users) => users.value());
}

function find(id) {
	return db
		.then((users) => users.find({ id }))
		.then((users) => users.value());
}

module.exports = {
	hasUsers,
	find
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
						type: BORROWER

					}

				]
			}))
			.then((database) => database.write());
	});
