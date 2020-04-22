const dbBuilder = require("../helpers/dbBuilder");

let { db, exports: publishers } = dbBuilder("./publishers.json");

module.exports = publishers;

if (db.count() === 0) {
	db.insert([
		{
			foreignID: 108,
			value: "Gamewright"
		}
	]);

	db.save();
}
