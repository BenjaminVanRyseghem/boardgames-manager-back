const dbBuilder = require("../helpers/dbBuilder");

let { db, exports: mechanics } = dbBuilder("./mechanics.json");

module.exports = mechanics;

if (db.count() === 0) {
	db.insert([
		{
			foreignID: 2023,
			value: "Cooperative Game"
		}
	]);

	db.save();
}
