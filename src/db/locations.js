const dbBuilder = require("../helpers/dbBuilder");

let { exports: locations } = dbBuilder("locations", [
	{
		id: "7",
		name: "Boite 7"
	}
]);

module.exports = locations;
