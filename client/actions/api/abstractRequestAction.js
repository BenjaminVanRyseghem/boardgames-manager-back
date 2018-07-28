/* eslint-disable max-statements */
import abstractRsaaAction from "./abstractRsaaAction";

/**
 * AbstractRequestAction is the abstraction of a redux-api action.
 *
 * We use the Crockford style here for 2 things:
 * - dodge redux plain object check
 * - avoid exposing `payload` to avoid mutations
 *
 * @abstract
 *
 * @param {*} spec - Unused parameter
 * @param {Object} [my] - Protected properties holder
 * @constructor AbstractRequestAction
 */
export default function AbstractRequestAction(spec, my = {}) {
	/** @lends AbstractRequestAction.prototype */
	let that = {};

	that.isRequestAction = true;
	that.isAction = true;
	that.type = "AbstractRequestAction";

	my.endpoint = "you should override AbstractRequestAction/my.endpoint";
	my.schema = {};
	my.body = null;

	my.actions = {
		success: abstractRsaaAction,
		failure: abstractRsaaAction,
		request: abstractRsaaAction
	};

	that.method = () => "GET";
	that.headers = () => ({});

	that.endpoint = () => my.endpoint;
	that.schema = () => my.schema;
	that.body = () => my.body;
	that.actions = () => my.actions;

	/*
	 * For each reducer (named Foo), there must be a method named
	 * `performFooReducer` implemented here as follow:
	 *
	 *     that.performFooReducer = my.identity;
	 *
	 * This method is mandatory to ensure that actions dispatched to unwanted
	 * reducers absorbs the message sent.
	 *
	 * The double dispatch here allow different team to work on the same action
	 * in the context of different reducer by greatly reducing the chance of
	 * merge conflicts.
	 */

	/**
	 * Double dispatch method for the [Account reducer]{@link GamesReducer}.
	 * @function
	 *
	 * @param {Object} state - State object
	 * @return {Object} new state
	 */
	that.performGameReducer = (state) => state;

	/**
	 * Double dispatch method for the [Users reducer]{@link UndoReducer}.
	 * @function
	 *
	 * @param {Object} state - State object
	 * @return {Object} new state
	 */
	that.performUndoReducer = (state) => state;

	return that;
}
