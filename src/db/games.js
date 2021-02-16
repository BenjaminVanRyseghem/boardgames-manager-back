/* eslint {"max-lines": [2, 450]} */
const users = require("./users");
const publishersDB = require("./publishers");
const categoriesDB = require("./categories");
const mechanicsDB = require("./mechanics");
const locations = require("./locations");

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileAsync");
const adapter = new FileSync("./db/games.json");
const lodashId = require("lodash-id");
const types = require("../models/types");
const { expansion } = require("../models/types");

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
	name: nameOfGame,
	showExpansions
};

function nameOfGame(nameFragment) {
	let normalizedFragment = nameFragment.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	return (datum) => {
		let normalizedDatum = datum.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		return normalizedDatum.match(new RegExp(normalizedFragment, "i"));
	};
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

function showExpansions(bool) {
	return (datum) => {
		if (!datum.type) {
			return true; // let's assume it's a game
		}

		return bool === "1" || datum.type !== expansion;
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

	let result = Object.assign({}, game);
	let promises = [];

	if (result.borrowed && !result.borrowed.id) {
		promises.push(users.find(result.borrowed).then((user) => {
			result.borrowed = user;
		}));
	}

	if (result.location && !result.location.id) {
		promises.push(locations.find(result.location).then((user) => {
			result.location = user;
		}));
	}

	if (result.expand && !result.expand.id) {
		promises.push(db
			.then((data) => data.find({ foreignId: result.expand }))
			.then((basegame) => (result.expand = basegame)));
	}

	if (result.type === types.game) {
		promises.push(db
			.then((data) => data.filter({ expand: result.foreignId }).value())
			.then((games) => {
				result.expansions = games;
			}));
	}

	promises.push(
		...normalizePart({
			part: result.mechanics,
			database: mechanicsDB,
			reset: () => (result.mechanics = []),
			add: (datum) => result.mechanics.push(datum)
		}),
		...normalizePart({
			part: result.categories,
			database: categoriesDB,
			reset: () => (result.categories = []),
			add: (datum) => result.categories.push(datum)
		}),
		...normalizePart({
			part: result.publishers,
			database: publishersDB,
			reset: () => (result.publishers = []),
			add: (datum) => result.publishers.push(datum)
		})
	);

	return Promise.all(promises).then(() => result);
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
				games: []
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
