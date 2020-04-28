let users = require("./users");
let publishers = require("./publishers");
let categoriesDB = require("./categories");
let mechanics = require("./mechanics");
let locations = require("./locations");
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

function age(number) {
	return {
		minAge: { $lte: +number }
	};
}

function showBorrowed() {}

function categories(array) {
	let allFilter = array.map((string) => +string)

	return {
		categories: { $all: allFilter}
	};
}

function normalizeGame(game) {
	if (game.borrowed) {
		game.borrowed = users.find(game.borrowed).rows[0];
	}

	if (game.location) {
		game.location = locations.find(game.location).rows[0];
	}

	if (game.mechanics) {
		game.mechanics = game.mechanics.map((mechanic) => mechanics.find(mechanic).rows[0]);
	}

	if (game.categories) {
		game.categories = game.categories.map((category) => categoriesDB.find(category).rows[0]);
	}

	if (game.publishers) {
		game.publishers = game.publishers.map((publisher) => publishers.find(publisher).rows[0]);
	}

	return game;
}

function getGame(id) {
	let result = db.find({ _id: id });
	if (!result.length) {
		return {
			length: 0,
			rows: []
		};
	}
	return {
		length: 1,
		rows: [normalizeGame(result.rows[0])]
	};
}

const actions = {
	age,
	categories,
	showBorrowed,
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

function has({ foreignId }) {
	return !!db.find({
		foreignId
	}).length;
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

	if (!+filters.showBorrowed) {
		Object.assign(query, { borrowed: { $exists: false } });
	}

	return query;
}

function getAllGames(rawFilters = {}) {
	let filters = trimFilters(rawFilters);

	let query = buildQueryFrom(filters);
	let result = db
		.find(query)
		.sort({ name: 1 });

	result.rows = result.rows.map((row) => normalizeGame(row));

	return result;
}

function register(game) {
	let data = { ...game };

	data.categories = categoriesDB.addMultipleIfNotPresent(data.categories);
	data.publishers = publishers.addMultipleIfNotPresent(data.publishers);
	data.mechanics = mechanics.addMultipleIfNotPresent(data.mechanics);

	if (has(game)) {
		db.update({ foreignId: game.foreignId }, { $set: data }, {
			multi: true,
			upsert: true
		});
	} else {
		db.insert(data);
		db.save();
	}

	return data;
}

module.exports = {
	has,
	getAllGames,
	register,
	getGame
};

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
			borrowed: 12,
			picture: "https://cf.geekdo-images.com/original/img/FwnbGGrU7av4j8kB11VZZRB58U4=/0x0/pic1196191.jpg",
			location: 7,
			publishers: [108],
			yearPublished: "2012",
			categories: [1022],
			mechanics: [2023]
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
			location: 7,
			publishers: [108],
			yearPublished: "2013",
			categories: [1022],
			mechanics: [2023]
		}
	]);

	db.save();
}

