let queryable = require("queryable");

let db = queryable.open("./games.json");

function nameOfGame(nameFragment) {
	return { name: new RegExp(nameFragment, "i") };
}

function numberOfPlayers(number) {
	return {
		playersMin: { $lte: number },
		playersMax: { $gte: number }
	};
}

const actions = {
	numberOfPlayers,
	name: nameOfGame
};

function trimFilters(filters) {
	let result = {};

	Object.keys(filters).forEach((key) => {
		if (actions[key]) {
			result[key] = filters[key];
		}
	});

	return result;
}

function buildQueryFrom(filters) {
	let query = {};

	Object.keys(filters).forEach((name) => {
		let argument = filters[name];

		if (argument === false) {
			return;
		}

		Object.assign(query, actions[name](argument));
	});

	return query;
}

function getAllGames(rawFilters = {}) {
	let filters = trimFilters(rawFilters);

	let query = buildQueryFrom(filters);
	return db.find(query);
}

if (db.count() === 0) {
	db.insert([
		{
			name: "Zombicide",
			playersMin: 1,
			playersMax: 5,
			time: 90,
			picture: "http://1.bp.blogspot.com/-1cZGf_c7gLM/U6fR8FiQMQI/AAAAAAAAAsw/ISJz9dXSO3g/s1600/zombicide_box_boardgame.jpg",
			lent: null,
			box: 7,
			publisher: "CMON",
			tags: []
		},
		{
			name: "Bar",
			playersMin: 1,
			playersMax: 2,
			time: 45,
			picture: "https://ksr-ugc.imgix.net/assets/017/286/715/3c9a9652e981ad284f1bf64e9cb845ca_original.png?w=700&fit=max&v=1498604645&auto=format&q=92&s=685f8195d0672ce93c2ed342b0238e1e",
			lent: "Benjamin Van Ryseghem",
			box: 5,
			publisher: "Asmodée",
			tags: ["foo", "bar"]
		},
		{
			name: "Baz",
			playersMin: 3,
			playersMax: 12,
			time: 15,
			picture: "https://www.gamesquest.co.uk/blog/wp-content/uploads/2016/03/Zombicide-Black-Plague-Board-Game.jpg",
			lent: null,
			box: 7,
			publisher: "CMON",
			tags: ["cooperation", "horror", "zombie"]
		}
	]);

	db.save();
}

function getAllPublishers() {
	return db.distinct("publisher");
}

module.exports = {
	getAllGames,
	getAllPublishers
};
