const dbBuilder = require("../helpers/dbBuilder");

let { exports: categories } = dbBuilder("categories", []);

module.exports = categories;
