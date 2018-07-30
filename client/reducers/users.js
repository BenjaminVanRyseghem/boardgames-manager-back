const initialState = {
	hasUsers: null,
	currentUser: null
};

/**
 * Reducer managing contingent.
 *
 * @name UsersReducer
 *
 * @param {Object} state - Current application state
 * @param {AbstractAction} action - Action to dispatch
 * @return {Object} new state
 */
export default (state = initialState, action) => {
	if (!action.isAction) { // TODO: remove when we use new style action everywhere
		return state;
	}

	return action.performUserReducer(state);
};
