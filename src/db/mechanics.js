const dbBuilder = require("../helpers/dbBuilder");

let { exports: mechanics } = dbBuilder("mechanics", [
	{
		id: "1",
		foreignId: 2023,
		name: "Cooperative Game"
	}
]);

module.exports = mechanics;
