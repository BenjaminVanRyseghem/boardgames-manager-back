let queryable = require("queryable");

/**
 * Build simple and similar DB for meta information as `publishers`, `categories` or `mechanics`.
 *
 * @param {string} path - Path to the DB file
 * @return {object} db and functions to export
 */
module.exports = function dbBuilder(path) {
	let db = queryable.open(path);

	function getAll() {
		return db.find();
	}

	function find(foreignId) {
		return db.find({
			foreignId
		});
	}

	function has({ foreignId }) {
		return !!find(foreignId).length;
	}

	function addMultipleIfNotPresent(data = []) {
		let shouldSave = false;
		let result = data.map((datum) => {
			if (!has(datum)) {
				shouldSave = true;
				db.insert(datum);
			}

			return datum.foreignId;
		});

		if (shouldSave) {
			db.save();
		}

		return result;
	}

	return {
		db,
		exports: {
			getAll,
			has,
			find,
			addMultipleIfNotPresent
		}
	};
};
