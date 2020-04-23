let queryable = require("queryable");

let db = queryable.open("./users.json");

const BORROWER = Symbol("borrower");

function hasUsers() {
	return !!db.count();
}

function find(id) {
	return db.find({ _id: id });
}

module.exports = {
	hasUsers,
	find
};

if (db.count() === 0) {
	db.insert([
		{
			_id: 12,
			lastName: "Sebastien",
			firstName: "Julien",
			type: BORROWER
		}
	]);

	db.save();
}
