const dbBuilder = require("../helpers/dbBuilder");

let { exports: categories } = dbBuilder("categories", [
	{
		id: "1",
		foreignId: 1022,
		value: "Adventure"
	}
]);

module.exports = categories;
