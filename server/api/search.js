const request = require("request");
const xml2json = require("xml2json");

let convertXmlToJson = (xml) => {
	let raw = JSON.parse(xml2json.toJson(xml));
	let result = raw.items.item.map((data) => {
		let thing = {
			type: data.type,
			name: data.name.value,
			id: data.id,
			source: "boardgamegeek",
			page: `https://www.boardgamegeek.com/${data.type}/${data.id}`
		};

		if (data.yearpublished) {
			thing.yearpublished = data.yearpublished.value;
		}

		return thing;
	});

	return result;
};

module.exports = (router) => {
	router.route("/search/bgg")
		.get((req, res) => {
			request.get(`https://www.boardgamegeek.com/xmlapi2/search?query=${req.query.name}`, (err, { statusCode }, body) => {
				if (!err && statusCode === 200) {
					res.setHeader("Content-Type", "application/json");
					res.send(convertXmlToJson(body));
				} else {
					res.status(500);
					res.setHeader("Content-Type", "application/json");
					res.send(JSON.stringify({
						error: err,
						code: 500
					}));
				}
			});
		});
};
