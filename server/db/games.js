let queryable = require("queryable");

let db = queryable.open("./games.json");

function nameOfGame(nameFragment) {
	return { name: new RegExp(nameFragment, "i") };
}

function numberOfPlayers(number) {
	return {
		minPlayers: { $lte: number },
		maxPlayers: { $gte: number }
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
			description: "Zombicide is a collaborative game in which players take the role of a survivor &amp;ndash; each with unique abilities &amp;ndash; and harness both their skills and the power of teamwork against the hordes of unthinking undead! Zombies are predictable, stupid but deadly, controlled by simple rules and a deck of cards. Unfortunately for you, there are a LOT more zombies than you have bullets.&amp;#10;&amp;#10;Find weapons, kill zombies. The more zombies you kill, the more skilled you get; the more skilled you get, the more zombies appear. The only way out is zombicide!&amp;#10;&amp;#10;Play ten scenarios on different maps made from the included modular map tiles, download new scenarios from the designer's website, or create your own!&amp;#10;&amp;#10;&amp;#10;     This is just a great game for zombie lovers!&amp;#10;&amp;#10;&amp;#10;Integrates with:&amp;#10;&amp;#10;    Zombicide Season 2: Prison Outbreak&amp;#10;    Zombicide Season 3: Rue Morgue&amp;#10;&amp;#10;&amp;#10;&amp;#10;&amp;#10;",
			minPlayers: 1,
			maxPlayers: 5,
			minPlaytime: 90,
			maxPlaytime: 180,
			minAge: 13,
			picture: "https://cf.geekdo-images.com/original/img/FwnbGGrU7av4j8kB11VZZRB58U4=/0x0/pic1196191.jpg",
			lent: null,
			box: 7,
			publisher: "CMON Limited",
			yearPublished: "2012",
			categories: ["Horror", "Miniatures", "Zombies"],
			mechanics: ["Action Point Allowance System", "Cooperative Play", "Dice Rolling", "Hand Management", "Modular Board", "Player Elimination", "Variable Player Powers"]
		},
		{
			name: "Forbidden Desert",
			description: "Game description from the publisher:&amp;#10;&amp;#10;Gear up for a thrilling adventure to recover a legendary flying machine buried deep in the ruins of an ancient desert city. You'll need to coordinate with your teammates and use every available resource if you hope to survive the scorching heat and relentless sandstorm. Find the flying machine and escape before you all become permanent artifacts of the forbidden desert!&amp;#10;&amp;#10;In Forbidden Desert, a thematic sequel to Forbidden Island, players take on the roles of brave adventurers who must throw caution to the wind and survive both blistering heat and blustering sand in order to recover a legendary flying machine buried under an ancient desert city. While featuring cooperative gameplay similar to Forbidden Island, Forbidden Desert is a fresh, new game based around an innovative set of mechanisms such as an ever-shifting board, individual resource management, and a unique method for locating the flying machine parts.&amp;#10;&amp;#10;",
			minPlayers: 2,
			maxPlayers: 5,
			minPlaytime: 45,
			maxPlaytime: 45,
			minAge: 10,
			picture: "https://cf.geekdo-images.com/original/img/wYvf6LExNhb3rflp_QYmCK_NhMc=/0x0/pic1528722.jpg",
			lent: null,
			box: 7,
			publisher: "Gamewright",
			yearPublished: "2013",
			categories: ["Adventure", "Fantasy", "Science Fiction"],
			mechanics: ["Action Point Allowance System", "Cooperative Play", "Grid Movement", "Modular Board", "Pick-up and Deliver", "Set Collection", "Variable Player Powers"]
		},
	]);

	db.save();
}

function getAllPublishers() {
	return db.distinct("publisher").rows.map((game) => game.publisher);
}

module.exports = {
	getAllGames,
	getAllPublishers
};
