import abstractRequestAction from "../abstractRequestAction";
import abstractRsaaAction from "../abstractRsaaAction";

function Success(spec, my = {}) {
	/** @lends Success.prototype */
	let that = abstractRsaaAction(spec, my);

	that.type = "Users/GetAll/Success";

	that.performUserReducer = (state) => {
		let hasUsers = that.payload();

		return Object.assign({}, state, { hasUsers });
	};

	return that;
}

/**
 * @constructor HasUsers
 *
 * @extends AbstractRequestAction
 * @param {*} spec - Unused parameter
 * @param {Object} [my] - Protected properties holder
 */
export default function HasUsers(spec, my = {}) {
	/** @lends HasUsers.prototype */
	let that = abstractRequestAction(spec, my);

	my.endpoint = "/hasUsers";

	my.actions = Object.assign({}, my.actions, {
		success: Success
	});

	return that;
}
