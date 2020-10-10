/* eslint {"max-lines": [2, 450]} */
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
	publishers,
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

function filterMeta(key, stringOrArray) {
	let array = stringOrArray.constructor === Array ? stringOrArray : [stringOrArray];

	return (datum) => {
		if (!datum[key] || !datum[key].length) {
			return false;
		}

		if (!datum[key][0] || !datum[key][0].id) {
			return array.some((id) => datum[key].includes(id));
		}

		return array.some((id) => datum[key].find((each) => each.id === id));
	};
}

function categories(stringOrArray) {
	return filterMeta("categories", stringOrArray);
}

function mechanics(stringOrArray) {
	return filterMeta("mechanics", stringOrArray);
}

function publishers(stringOrArray) {
	return filterMeta("publishers", stringOrArray);
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

function hasById({ id }) {
	return db
		.then((data) => data.find({ id }))
		.then((data) => !!data.value());
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

function findAndUpdate(game, existFn, findOption) {
	let promises = [];

	game.categories &&
	game.categories.length &&
	categoriesDB.addMultipleIfNotPresent(game.categories).then((newData) => (game.categories = newData));

	game.publishers &&
	game.publishers.length &&
	publishersDB.addMultipleIfNotPresent(game.publishers).then((newData) => (game.publishers = newData));

	game.mechanics &&
	game.mechanics.length &&
	mechanicsDB.addMultipleIfNotPresent(game.mechanics).then((newData) => (game.mechanics = newData));

	return Promise.all(promises)
		.then(() => existFn(game))
		.then((isPresent) => {
			if (isPresent) {
				return db
					.then((database) => database.find(findOption))
					.then((database) => database.assign(game));
			}
			return db
				.then((database) => database.insert(game));
		})
		.then((database) => database.write())
		.then((writtenData) => normalizeGame(writtenData));
}

function update(game) {
	return findAndUpdate(game, hasById, { id: game.id });
}

function deleteGame({ id }) {
	return db
		.then((database) => database.remove({ id }))
		.then((database) => database.write());
}

function register(game) {
	return findAndUpdate({
		location: "1",
		...game,
		borrowed: null
	}, has, { foreignId: game.foreignId });
}

function countInLocation(location) {
	return db
		.then((data) => data.filter((game) => game.location &&
			(game.location === location || game.location.id === location)))
		.then((data) => data.value())
		.then((games) => games.length);
}

function findInLocation(location) {
	return db
		.then((data) => data.filter((game) => game.location &&
			(game.location === location || game.location.id === location)))
		.then((data) => data.value())
		.then((games) => Promise.all(games.map((game) => normalizeGame(game))));
}

function countByUser({ id }) {
	return db
		.then((data) => data.filter((game) => game.borrowed &&
				(game.borrowed === id || game.borrowed.id === id)))
		.then((data) => data.value())
		.then((games) => games.length);
}

function findByUser(user) {
	return db
		.then((data) => data.filter((game) => game.borrowed &&
				(game.borrowed === user || game.borrowed.id === user)))
		.then((data) => data.value())
		.then((games) => Promise.all(games.map((game) => normalizeGame(game))));
}

module.exports = {
	has,
	getAllGames,
	register,
	update,
	deleteGame,
	getGame,
	findInLocation,
	countInLocation,
	countByUser,
	findByUser
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
						borrowed: "12",
						picture: "https://cf.geekdo-images.com/original/img/FwnbGGrU7av4j8kB11VZZRB58U4=/0x0/pic1196191.jpg",
						location: "7",
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
						location: "7",
						publishers: ["1"],
						yearPublished: "2013",
						categories: ["1"],
						mechanics: ["1"]
					}
				]
			}))
			.then((database) => database.write());
	});

/**
 * @swagger
 *  components:
 *    schemas:
 *      Games:
 *        type: array
 *        items:
 *          $ref: '#/components/schemas/Game'
 *      Game:
 *        type: object
 *        required:
 *          - id
 *          - foreignId
 *          - name
 *          - description
 *          - minPlayers
 *          - maxPlayers
 *          - minPlaytime
 *          - maxPlaytime
 *          - minAge
 *          - picture
 *          - yearPublished
 *        properties:
 *          id:
 *            type: string
 *          foreignId:
 *            type: string
 *          name:
 *            type: string
 *          description:
 *            type: string
 *          minPlayers:
 *            type: number
 *          maxPlayers:
 *            type: number
 *          minPlaytime:
 *            type: number
 *          maxPlaytime:
 *            type: number
 *          borrowed:
 *            type: string
 *            nullable: true
 *          minAge:
 *            type: number
 *          picture:
 *            type: string
 *          categories:
 *            type: array
 *            items:
 *              type: string
 *          publishers:
 *            type: array
 *            items:
 *            $ref: '#/components/schemas/Publisher'
 *          mechanics:
 *            type: array
 *            items:
 *              type: string
 *          yearPublished:
 *            type: string
 *        example:
 *           id: "b50797f0-fa61-407f-9f45-48b5db6257ac"
 *           name: "Zombicide"
 *           description: "A game with zombies"
 *           minPlayers: 2
 *           maxPlayers: 6
 *           minPlaytime: 45
 *           maxPlaytime: 120
 *           borrowed: null
 *           minAge: 14
 *           picture: "https://cf.geekdo-images.com/original/img/wYvf6LExNhb3rflp_QYmCK_NhMc=/0x0/pic1528722.jpg"
 *           yearPublished: "2013"
 *           publisher: [{id: "b50797f0-fa61-407f-9f45-48b5db6257ac", foreignId: "1024", name: "Asmodee"}]
 */
