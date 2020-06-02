const dbBuilder = require("../helpers/dbBuilder");

let { exports: locations } = dbBuilder("locations", [
	{
		id: "7",
		name: "Box #7"
	},
	{
		id: "2",
		name: "Living Room"
	}
]);

module.exports = locations;
