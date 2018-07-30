let games = require("./api/games");
let publishers = require("./api/publishers");
let search = require("./api/search");
let users = require("./api/users");

module.exports = (router) => {
	games(router);
	publishers(router);
	search(router);
	users(router);
};
