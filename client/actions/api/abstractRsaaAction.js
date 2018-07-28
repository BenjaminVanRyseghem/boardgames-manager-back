import abstractAction from "../abstractAction";

/**
 * @constructor AbstractRSAAAction
 *
 * @abstract
 *
 * @extends AbstractAction
 * @param {Object} params - Params object
 * @param {*} params.payload - Action payload
 * @param {*} params.meta - Action payload
 * @param {Object} [my] - Protected properties holder
 */
export default function AbstractRSAAAction({ payload, meta }, my = {}) {
	/** @lends AbstractRSAAAction.prototype */
	let that = abstractAction(payload, my);

	my.meta = meta;

	that.meta = () => my.meta;
	that.payload = (...args) => my.payload(...args);

	return that;
}
