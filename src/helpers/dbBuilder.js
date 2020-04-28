const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileAsync");
const lodashId = require("lodash-id");

/**
 * Build simple and similar DB for meta information as `publishers`, `categories` or `mechanics`.
 *
 * @param {string} path - Path to the DB file
 * @param {object} initialValues - Defaults db entries
 * @return {object} db and functions to export
 */
module.exports = function dbBuilder(path, initialValues) {
	const adapter = new FileSync(`./${path}.json`);
	let db = low(adapter).then((database) => {
		database._.mixin(lodashId);
		return database.get(path);
	});

	function getAll() {
		return db
			.then((data) => data.value());
	}

	function find(id) {
		return db
			.then((data) => data.find({ id }))
			.then((data) => data.value());
	}

	function hasForeign({ foreignId }) {
		return db
			.then((data) => data.find({ foreignId }))
			.then((data) => data.value());
	}

	function addMultipleIfNotPresent(data = []) {
		let result = data.map((datum) => hasForeign(datum)
			.then((matchingElement) => {
				if (!matchingElement) {
					return db
						.then((database) => database.insert(datum))
						.then((database) => database.write());
				}
				return matchingElement;
			})
			.then((matchingData) => matchingData.id));

		return Promise.all(result);
	}

	db
		.then((data) => data.value())
		.then((data) => {
			if (!data) {
				throw new Error("Empty DB");
			}
		})
		.catch(() => {
			low(adapter)
				.then((database) => database.defaults({
					[path]: initialValues
				}))
				.then((database) => database.write());
		});

	return {
		exports: {
			getAll,
			hasForeign,
			find,
			addMultipleIfNotPresent
		}
	};
};
