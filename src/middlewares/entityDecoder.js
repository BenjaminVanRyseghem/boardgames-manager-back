const Entities = require("html-entities").AllHtmlEntities;

const entities = new Entities();

function decodeValue(value) {
	if (typeof value === "string") {
		return entities.decode(value);
	}

	if (value.constructor === Object) {
		Object.keys(value).forEach((key) => {
			value[key] = decodeValue(value[key]);
		});

		return value;
	}

	return value;
}

module.exports = function entityDecoder() {
	return (req, res, next) => {
		[req.body, req.query].forEach((val, ipar, request) => {
			request[ipar] = decodeValue(val);
		});

		next();
	};
};
