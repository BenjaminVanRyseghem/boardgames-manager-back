const dbBuilder = require("../helpers/dbBuilder");

let { exports: publishers } = dbBuilder("publishers", [
	{
		id: "1",
		foreignId: 108,
		value: "Gamewright"
	}
]);

module.exports = publishers;
