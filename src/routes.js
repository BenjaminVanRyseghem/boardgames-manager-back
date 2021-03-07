const { Router } = require("express");
const routes = new Router();

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const games = require("./api/games");
const categories = require("./api/categories");
const mechanics = require("./api/mechanics");
const publishers = require("./api/publishers");
const locations = require("./api/locations");
const search = require("./api/search");
const users = require("./api/users");
const maintenance = require("./api/maintenance");

routes.route("/").get((req, res) => {
	res.json({ message: "Welcome to boardgames-manager API!" });
});

routes.use("/game", games);
routes.use("/publisher", publishers);
routes.use("/location", locations);
routes.use("/category", categories);
routes.use("/mechanic", mechanics);
routes.use("/search", search);
routes.use("/user", users);
routes.use("/maintenance", maintenance);

const options = {
	swaggerDefinition: {
		openapi: "3.0.0",
		info: {
			title: "Boardgames manager API",
			version: "1.0.0",
			description:
				"Express API for Boardgames Manager",
			license: {
				name: "GNU General Public License v3.0",
				url: "https://choosealicense.com/licenses/gpl-3.0/"
			},
			contact: {
				name: "Benjamin Van Ryseghem",
				url: "https://benjamin.vanryseghem.com",
				email: "benjamin@vanryseghem.com"
			}
		},
		servers: [
			{
				url: "http://localhost:8080/api/v1"
			}
		]
	},
	apis: [
		path.resolve(__dirname, "./api/**/*.js"),
		path.resolve(__dirname, "./db/**/*.js")
	]
};
const specs = swaggerJsdoc(options);
routes.use("/docs", swaggerUi.serve);
routes.get(
	"/docs",
	swaggerUi.setup(specs, {
		explorer: true
	})
);

module.exports = routes;
