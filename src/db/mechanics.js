const dbBuilder = require("../helpers/dbBuilder");

let { exports: mechanics } = dbBuilder("mechanics", []);

module.exports = mechanics;
