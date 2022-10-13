const low = require("lowdb");
const { join } = require("path");
const FileSync = require("lowdb/adapters/FileAsync");
const lodashId = require("lodash-id");

const identity = (each) => Promise.resolve(each);

/**
 * Build simple and similar DB for meta information as `publishers`, `categories` or `mechanics`.
 *
 * @param {string} path - Path to the DB file
 * @param {object} initialValues - Defaults db entries
 * @param {object} options - Options object parameter
 * @param {Function} options.normalize - function used to normalize objects
 * @return {object} db and functions to export
 */
module.exports = function dbBuilder(path, initialValues, { normalize = identity } = {}) {
	let filePath = join(__dirname, "..", "..", "db", `${path}.json`);
	const adapter = new FileSync(filePath);
	let db = low(adapter).then((database) => {
		database._.mixin(lodashId);
		return database.get(path);
	});

	function getAll() {
		return db
			.then((data) => data.value())
			.then((data) => {
				if (!data) {
					return Promise.resolve([]);
				}

				let promises = data.map(normalize);
				return Promise.all(promises);
			});
	}

	function update(id, patch) {
		return db
			.then((data) => data.find({ id }))
			.then((data) => data.assign(patch))
			.then((data) => data.write())
			.then((data) => normalize(data));
	}

	function find(id) {
		return db
			.then((data) => data.find({ id }))
			.then((data) => data.value())
			.then((data) => {
				if (!data) {
					throw new Error("404");
				}
				return data;
			})
			.then((data) => normalize(data));
	}

	function findWithForeignKey({ foreignId }) {
		return db
			.then((data) => data.find({ foreignId }))
			.then((data) => data.value());
	}

	function insert(data) {
		return db
			.then((database) => database.insert(data))
			.then((database) => database.write());
	}

	function remove({ id }) {
		return db
			.then((database) => database.remove({ id }))
			.then((database) => database.write());
	}

	function addMultipleIfNotPresent(data = []) {
		let result = data.map((datum) => findWithForeignKey(datum)
			.then((matchingElement) => {
				if (!matchingElement) {
					return insert(datum);
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
			insert,
			update,
			remove,
			getAll,
			find,
			addMultipleIfNotPresent
		}
	};
};
