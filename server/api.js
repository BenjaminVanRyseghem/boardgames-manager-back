let games = require("./api/games");
let publishers = require("./api/publishers");

module.exports = (router) => {
	games(router);
	publishers(router);
};
