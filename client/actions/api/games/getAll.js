import abstractRequestAction from "../abstractRequestAction";
import abstractRsaaAction from "../abstractRsaaAction";
import querystring from "querystring";

/**
 * GetAllSuccess is performed when all contingents had been requested from the server with success.
 * @constructor GetAllSuccess
 *
 * @extends AbstractRequestAction
 *
 * @param {Object} spec - Unused parameter
 * @param {Object} [my] - Protected properties holder
 */
function GetAllSuccess(spec, my = {}) {
	/** @lends GetAllSuccess.prototype */
	let that = abstractRsaaAction(spec, my);

	that.type = "Games/GetAll/Success";

	that.performGameReducer = (state) => {
		let { data: { rows: games } } = that.payload();

		return Object.assign({}, state, { games });
	};

	return that;
}

/**
 * @constructor GetAll
 *
 * @extends AbstractRequestAction
 * @param {*} spec - Unused parameter
 * @param {Object} [my] - Protected properties holder
 */
export default function GetAll(spec, my = {}) {
	/** @lends GetAll.prototype */
	let that = abstractRequestAction(spec, my);

	let { filters = {} } = spec;

	my.endpoint = `/games?${querystring.stringify(filters)}`;

	my.actions = Object.assign({}, my.actions, {
		success: GetAllSuccess
	});

	return that;
}
