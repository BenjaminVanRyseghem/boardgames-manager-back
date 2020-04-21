const request = require("request");
const xml2json = require("xml2json");

let convertXmlToJson = (xml) => {
	let raw = JSON.parse(xml2json.toJson(xml));
	if (raw.items.total === "0" || !raw.items.item) {
		return {
			length: 0,
			rows: []
		};
	}

	if (raw.items.total === "1") {
		raw.items.item = [raw.items.item];
	}

	let rows = raw.items.item.map((data) => {
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

	return {
		length: rows.length,
		rows
	};
};

module.exports = (router) => {
	router.route("/search/bgg")
		.get((req, res) => {
			let uri = `https://www.boardgamegeek.com/xmlapi2/search?query=${req.query.name}&type=${req.query.type}`;
			if (req.query.exact === "true") {
				uri += "&exact=1";
			}
			request.get(uri, (err, { statusCode }, body) => {
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
