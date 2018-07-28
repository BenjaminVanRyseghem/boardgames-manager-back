/**
 * AbstractAction is the abstraction of a reducer action.
 *
 * We use the Crockford style here for 2 things:
 * - dodge redux plain object check
 * - avoid exposing `payload` to avoid mutations
 *
 * @abstract
 *
 * @param {*} payload - Action payload
 * @param {Object} [my] - Protected properties holder
 * @constructor AbstractAction
 */
export default function AbstractAction(payload, my = {}) {
	/**
	 * @lends AbstractAction.prototype
	 */
	let that = {};

	my.payload = payload;

	that.isAction = true;
	that.type = "Do We Care?";

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

	return that;
}
