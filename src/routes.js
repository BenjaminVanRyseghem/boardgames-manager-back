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

routes.route("/").get((req, res) => {
	res.json({ message: "Welcome to mini42-backend API!" });
});

routes.use("/game", games);
routes.use("/publisher", publishers);
routes.use("/location", locations);
routes.use("/category", categories);
routes.use("/mechanic", mechanics);
routes.use("/search", search);
routes.use("/user", users);

const options = {
	swaggerDefinition: {
		openapi: "3.0.0",
		info: {
			title: "Time to document that Express API you built",
			version: "1.0.0",
			description:
				"A test project to understand how easy it is to document and Express API",
			license: {
				name: "MIT",
				url: "https://choosealicense.com/licenses/mit/"
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
