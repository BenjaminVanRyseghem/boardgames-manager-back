let queryable = require("queryable");

let db = queryable.open("./locations.json");

function find(id) {
	return db.find({ _id: id });
}

module.exports = {
	find
};

if (db.count() === 0) {
	db.insert([
		{
			_id: 7,
			name: "Boite 7"
		}
	]);

	db.save();
}
