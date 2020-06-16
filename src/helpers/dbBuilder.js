const low = require("lowdb");
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
	const adapter = new FileSync(`./${path}.json`);
	let db = low(adapter).then((database) => {
		database._.mixin(lodashId);
		return database.get(path);
	});

	function getAll() {
		return db
			.then((data) => data.value())
			.then((data) => {
				let promises = data.map(normalize);
				return Promise.all(promises);
			});
	}

	function find(id) {
		return db
			.then((data) => data.find({ id }))
			.then((data) => data.value())
			.then((data) => normalize(data));
	}

	function findWithForeignKey({ foreignId }) {
		return db
			.then((data) => data.find({ foreignId }))
			.then((data) => data.value());
	}

	function addMultipleIfNotPresent(data = []) {
		let result = data.map((datum) => findWithForeignKey(datum)
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
			find,
			addMultipleIfNotPresent
		}
	};
};
