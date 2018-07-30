let queryable = require("queryable");

let db = queryable.open("./users.json");

function hasUsers() {
	return !!db.count();
}

module.exports = {
	hasUsers
};
