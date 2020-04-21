let queryable = require("queryable");

let db = queryable.open("./users.json");

function hasUsers() {
	return !!db.count();
}

function findUser(id) {
	return db.find({ _id: id });
}

module.exports = {
	hasUsers,
	findUser
};

if (db.count() === 0) {
	db.insert([
		{
			_id: 12,
			lastName: "Sebastien",
			firstName: "Julien"
		}
	]);

	db.save();
}
