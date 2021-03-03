const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

let { redirectToHTTPS } = require("express-http-to-https");
const bodyParser = require("body-parser");
const express = require("express");
const helmet = require("helmet");
const http = require("http");
const https = require("https");
const fs = require("fs");
const morgan = require("morgan");
const routes = require("./routes");

const config = require("./config");
const jwt = require("./helpers/jwt");

const expressSanitized = require("express-sanitize-escape");
const entityDecoder = require("./middlewares/entityDecoder");

// initialise express
let app = express();

app.use(redirectToHTTPS([
	/127.0.0.1/,
	/localhost:(\d{4})/
]));
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

if (process.env.USE_SSL && process.env.KEY && process.env.CERT) { // eslint-disable-line no-process-env
	let options = {
		key: fs.readFileSync(process.env.KEY), // eslint-disable-line no-sync,no-process-env
		cert: fs.readFileSync(process.env.CERT) // eslint-disable-line no-sync,no-process-env
	};
	let index = https.createServer(options, app).listen(config.server.sslPort, () => {
		console.log("\nSecured server ready on port %d\n", index.address().port); // eslint-disable-line no-console
	});
}

// start the server
let index = http.createServer(app).listen(config.server.port, () => { // eslint-disable-line no-process-env
	console.log("\nServer ready on port %d\n", index.address().port); // eslint-disable-line no-console
});
