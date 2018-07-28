let express = require("express");
let nunjucks = require("nunjucks");
let bodyParser = require("body-parser");

// initialise express
let app = express();

/*
 * configure app to use bodyParser()
 * this will let us get the data from a POST
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// use nunjucks to process view templates in express
nunjucks.configure("server/templates/views", {
	express: app
});

// public assets are served before any dynamic requests
app.use(express.static("dist"));

// eslint-disable-next-line new-cap
let router = express.Router();

require("./server/api")(router);

app.use("/api", router);

app.get("*", (req, res) => {
	/*
	 * this route will respond to all requests with the contents of your index
	 * template. Doing this allows react-router to render the view in the app.
	 */
	res.render("index.html");
});

// start the server
let server = app.listen(process.env.PORT || 3000, () => { // eslint-disable-line no-process-env
	console.log("\nServer ready on port %d\n", server.address().port);
});
