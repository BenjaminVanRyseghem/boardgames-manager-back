const types = require("../types");

function findName(itemName, type, search) {
	if (itemName.value) {
		return itemName.value;
	}

	let found = itemName.find((each) => each.type === type && each.value === search);

	if (found) {
		return found.value;
	}

	if (type !== "primary") {
		return findName(itemName, "primary", search);
	}

	return null;
}

const itemTypes = {
	boardgame: types.game,
	boardgameexpansion: types.expansion
};

function convertType(type) {
	return itemTypes[type] || types.game;
}

function computeComplexity(item) {
	let { ratings } = item.statistics;
	if (ratings.averageweight.value === "0" && ratings.numweights.value === "0") {
		return null;
	}

	return +ratings.averageweight.value * 100 / 5;
}

/**
 * TODO: Write jsdoc
 * @class
 */
module.exports = class BggAdapter {
	static import(data, type, search) {
		if (!data || !data.items || !data.items.item) {
			return null;
		}

		let { item } = data.items;

		let result = {
			foreignId: item.id,
			link: `https://www.boardgamegeek.com/boardgame/${item.id}`,
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
			mechanics: [],
			from: "boardgamegeek",
			type: convertType(item.type),
			complexity: computeComplexity(item)
		};

		if (result.type === types.expansion) {
			let link = item.link.find((each) => each.type === "boardgameexpansion" && each.inbound === "true");
			result.expand = link.id;
		}

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
