const dbBuilder = require("../helpers/dbBuilder");

let { exports: locations } = dbBuilder("locations", [
	{
		id: "1",
		name: "Default location"
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
