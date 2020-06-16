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
], {
	normalize(each) {
		const games = require("./games");

		return games.countInLocation(each.id)
			.then((count) => ({
				...each,
				numberOfGames: count
			}));
	}
});

module.exports = locations;
