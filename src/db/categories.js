const dbBuilder = require("../helpers/dbBuilder");

let { db, exports: categories } = dbBuilder("./categories.json");

module.exports = categories;

if (db.count() === 0) {
	db.insert([
		{
			foreignID: 1022,
			value: "Adventure"
		}
	]);

	db.save();
}
