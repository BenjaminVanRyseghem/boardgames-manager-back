const users = require("./users");
const publishersDB = require("./publishers");
const categoriesDB = require("./categories");
const mechanicsDB = require("./mechanics");
const locations = require("./locations");

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileAsync");
const adapter = new FileSync("./games.json");
const lodashId = require("lodash-id");

const db = low(adapter).then((database) => {
	database._.mixin(lodashId);
	return database.get("games");
});

const actions = {
	age,
	mechanics,
	categories,
	showBorrowed,
	numberOfPlayers,
	name: nameOfGame
};

function nameOfGame(nameFragment) {
	return (datum) => datum.name.match(new RegExp(nameFragment, "i"));
}

function numberOfPlayers(number) {
	return (datum) => datum.minPlayers <= number && datum.maxPlayers >= number;
}

function age(number) {
	return (datum) => datum.minAge <= +number;
}

function showBorrowed() {}

function categories(stringOrArray) {
	let array = stringOrArray.constructor === Array ? stringOrArray : [stringOrArray];

	return (datum) => {
		if (!datum.categories || !datum.categories.length) {
			return false;
		}

		if (!datum.categories[0] || !datum.categories[0].id) {
			return array.some((id) => datum.categories.includes(id));
		}

		return array.some((id) => datum.categories.find((category) => category.id === id));
	};
}

function mechanics(stringOrArray) {
	let array = stringOrArray.constructor === Array ? stringOrArray : [stringOrArray];

	return (datum) => {
		if (!datum.mechanics || !datum.mechanics.length) {
			return false;
		}

		if (!datum.mechanics[0] || !datum.mechanics[0].id) {
			return array.some((id) => datum.mechanics.includes(id));
		}

		return array.some((id) => datum.mechanics.find((category) => category.id === id));
	};
}

function normalizePart({ part, database, reset, add }) {
	let promises = [];

	if (part && part.length && part[0] && !part[0].id) {
		let temp = part;
		reset();
		promises.push(...temp.map((id) => database.find(id).then((datum) => {
			add(datum);
		})));
	}

	return promises;
}

// eslint-disable-next-line max-statements
function normalizeGame(game) {
	if (!game) {
		return Promise.resolve(undefined);
	}

	let promises = [];

	if (game.borrowed && !game.borrowed.id) {
		promises.push(users.find(game.borrowed).then((user) => {
			game.borrowed = user;
		}));
	}

	if (game.location && !game.location.id) {
		promises.push(locations.find(game.location).then((user) => {
			game.location = user;
		}));
	}

	promises.push(
		...normalizePart({
			part: game.mechanics,
			database: mechanicsDB,
			reset: () => (game.mechanics = []),
			add: (datum) => game.mechanics.push(datum)
		}),
		...normalizePart({
			part: game.categories,
			database: categoriesDB,
			reset: () => (game.categories = []),
			add: (datum) => game.categories.push(datum)
		}),
		...normalizePart({
			part: game.publishers,
			database: publishersDB,
			reset: () => (game.publishers = []),
			add: (datum) => game.publishers.push(datum)
		})
	);

	return Promise.all(promises).then(() => game);
}

function trimQueries(queries) {
	let result = {};

	Object.keys(queries).forEach((key) => {
		if (actions[key]) {
			result[key] = queries[key];
		}
	});

	return result;
}

function getGame(id) {
	return db
		.then((database) => database.find({ id }))
		.then((database) => database.value())
		.then((game) => {
			if (!game) {
				return game;
			}

			return normalizeGame(game);
		});
}

function has({ foreignId }) {
	return db
		.then((data) => data.find({ foreignId }))
		.then((data) => !!data.value());
}

function buildFiltersFrom(queries) {
	let filters = [];

	Object.keys(queries).forEach((name) => {
		let argument = queries[name];

		if (argument === false) {
			return;
		}

		filters.push(actions[name](argument));
	});

	if (!+queries.showBorrowed) {
		filters.push({ borrowed: null });
	}

	return filters;
}

function getAllGames(rawQueries = {}) {
	let queries = trimQueries(rawQueries);

	let filters = buildFiltersFrom(queries);
	let filter = db;

	filters.forEach((each) => {
		filter = filter.then((database) => database.filter(each));
	});

	return filter
		.then((database) => database.sortBy("name"))
		.then((database) => database.value())
		.then((games) => Promise.all(games.map((row) => normalizeGame(row))));
}

function register(game) {
	let data = {
		...game,
		borrowed: null
	};

	let promises = [
		categoriesDB.addMultipleIfNotPresent(data.categories).then((newData) => (data.categories = newData)),
		publishersDB.addMultipleIfNotPresent(data.publishers).then((newData) => (data.publishers = newData)),
		mechanicsDB.addMultipleIfNotPresent(data.mechanics).then((newData) => (data.mechanics = newData))
	];

	return Promise.all(promises)
		.then(() => has(game))
		.then((isPresent) => {
			if (isPresent) {
				return db
					.then((database) => database.find({ foreignId: game.foreignId }))
					.then((database) => database.assign(data));
			}
			return db
				.then((database) => database.insert(data));
		})
		.then((database) => database.write());
}

module.exports = {
	has,
	getAllGames,
	register,
	getGame
};

db
	.then((games) => games.value())
	.then((games) => {
		if (!games) {
			throw new Error("Empty DB");
		}
	})
	.catch(() => {
		low(adapter)
			.then((database) => database.defaults({
				games: [
					{
						id: "1",
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
						publishers: ["1"],
						yearPublished: "2012",
						categories: ["1"],
						mechanics: ["1"]
					},
					{
						id: "2",
						name: "Forbidden Desert",
						description: "Game description from the publisher:&amp;#10;&amp;#10;Gear up for a thrilling adventure to recover a legendary flying machine buried deep in the ruins of an ancient desert city. You'll need to coordinate with your teammates and use every available resource if you hope to survive the scorching heat and relentless sandstorm. Find the flying machine and escape before you all become permanent artifacts of the forbidden desert!&amp;#10;&amp;#10;In Forbidden Desert, a thematic sequel to Forbidden Island, players take on the roles of brave adventurers who must throw caution to the wind and survive both blistering heat and blustering sand in order to recover a legendary flying machine buried under an ancient desert city. While featuring cooperative gameplay similar to Forbidden Island, Forbidden Desert is a fresh, new game based around an innovative set of mechanisms such as an ever-shifting board, individual resource management, and a unique method for locating the flying machine parts.&amp;#10;&amp;#10;",
						minPlayers: 2,
						maxPlayers: 5,
						minPlaytime: 45,
						maxPlaytime: 45,
						borrowed: null,
						minAge: 10,
						picture: "https://cf.geekdo-images.com/original/img/wYvf6LExNhb3rflp_QYmCK_NhMc=/0x0/pic1528722.jpg",
						location: 7,
						publishers: ["1"],
						yearPublished: "2013",
						categories: ["1"],
						mechanics: ["1"]
					}
				]
			}))
			.then((database) => database.write());
	});
