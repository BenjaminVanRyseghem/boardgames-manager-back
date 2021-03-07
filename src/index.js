const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

let { redirectToHTTPS } = require("express-http-to-https");
const bodyParser = require("body-parser");
const compression = require("compression");
const express = require("express");
const helmet = require("helmet");
const http = require("http");
const https = require("https");
const fs = require("fs");
const morgan = require("morgan");
const routes = require("./routes");
const handleErrors = require("./handleErrors");
const session = require("express-session");

const MemoryStore = require("memorystore")(session);

const config = require("./config");
const jwt = require("./helpers/jwt");

const expressSanitized = require("express-sanitize-escape");
const entityDecoder = require("./middlewares/entityDecoder");

const twentyFourHours = 86400000;

// initialise express
let app = express();

let currentSession = {
	secret: process.env.SESSION_SECRET, // eslint-disable-line no-process-env
	cookie: { maxAge: twentyFourHours },
	store: new MemoryStore({
		checkPeriod: twentyFourHours
	}),
	resave: false,
	saveUninitialized: false
};

if (app.get("env") === "production") {
	app.set("trust proxy", 1);
	currentSession.cookie.secure = true;
}

app.use(session(currentSession));

app.use(redirectToHTTPS([
	/127.0.0.1/,
	/localhost:(\d{4})/
]));
app.use(compression());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("common"));
app.use(expressSanitized.middleware());
app.use(entityDecoder());

app.use("/api/", jwt());
app.use("/api/v1", routes);
app.use("/api/v1", handleErrors);

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
