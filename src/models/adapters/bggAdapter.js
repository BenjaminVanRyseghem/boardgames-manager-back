const xml2json = require("xml2json");

function findName(itemName, type, search) {
	if (itemName.value) {
		return itemName.value;
	}

	let nameRegexp = new RegExp(search, "i");
	return itemName.find((each) => each.type === type && each.value.match(nameRegexp)).value;
}

/**
 * TODO: Write jsdoc
 * @class
 */
module.exports = class BggAdapter {
	static import(xml, type, search) {
		let data = xml2json.toJson(xml, { object: true });
		if (!data || !data.items || !data.items.item) {
			return null;
		}

		let { item } = data.items;

		let result = {
			foreignId: item.id,
			name: findName(item.name, type, search),
			description: item.description,
			minPlayers: item.minplayers.value,
			maxPlayers: item.maxplayers.value,
			minPlaytime: item.minplaytime.value,
			maxPlaytime: item.maxplaytime.value,
			minAge: item.minage.value,
			picture: item.image,
			yearPublished: item.yearpublished.value,
			categories: [],
			publishers: [],
			mechanics: []
		};

		item.link.forEach((link) => {
			if (link.type === "boardgamecategory") {
				result.categories.push({
					foreignId: link.id,
					name: link.value
				});
			}

			if (link.type === "boardgamemechanic") {
				result.mechanics.push({
					foreignId: link.id,
					name: link.value
				});
			}

			if (link.type === "boardgamepublisher") {
				result.publishers.push({
					foreignId: link.id,
					name: link.value
				});
			}
		});

		return result;
	}
};
