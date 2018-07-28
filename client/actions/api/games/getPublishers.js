import abstractRequestAction from "../abstractRequestAction";
import abstractRsaaAction from "../abstractRsaaAction";

/**
 * GetAllSuccess is performed when all contingents had been requested from the server with success.
 * @constructor GetAllSuccess
 *
 * @extends AbstractRequestAction
 *
 * @param {Object} spec - Unused parameter
 * @param {Object} [my] - Protected properties holder
 */
function Success(spec, my = {}) {
	/** @lends GetAllSuccess.prototype */
	let that = abstractRsaaAction(spec, my);

	that.type = "Publishers/GetAll/Success";

	that.performGameReducer = (state) => {
		let { data: { rows: data } } = that.payload();

		return Object.assign({}, state, { publishers: data.map((datum) => datum.publisher) });
	};

	return that;
}

/**
 * @constructor GetAllPublishers
 *
 * @extends AbstractRequestAction
 * @param {*} spec - Unused parameter
 * @param {Object} [my] - Protected properties holder
 */
export default function GetAllPublishers(spec, my = {}) {
	/** @lends GetAllPublishers.prototype */
	let that = abstractRequestAction(spec, my);

	my.endpoint = "/publishers";

	my.actions = Object.assign({}, my.actions, {
		success: Success
	});

	return that;
}
