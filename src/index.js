require("dotenv").config();

const bodyParser = require("body-parser");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const routes = require("./routes");

const config = require("./config");
const jwt = require("./helpers/jwt");

const expressSanitized = require("express-sanitize-escape");
const entityDecoder = require("./middlewares/entityDecoder");

// initialise express
let app = express();

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(expressSanitized.middleware());
app.use(entityDecoder());

app.use("/api/", jwt());
app.use("/api/v1", routes);

app.use(express.static("public"));
app.use("/*", (req, res) => {
	res.sendFile(path.join(`${__dirname}/../public/index.html`));
});

app.get("/", (req, res) => {
	/*
	 * this route will respond to all requests with the contents of your index
	 * template. Doing this allows react-router to render the view in the app.
	 */
	res.render("index.html");
});

// start the server
let index = app.listen(config.server.port, () => { // eslint-disable-line no-process-env
	console.log("\nServer ready on port %d\n", index.address().port); // eslint-disable-line no-console
});
