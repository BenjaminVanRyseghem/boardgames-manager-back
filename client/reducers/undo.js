const initialState = {
	history: []
};

/**
 * Reducer managing undo/redo history.
 *
 * @name UndoReducer
 *
 * @param {Object} state - Current application state
 * @param {AbstractAction} action - Action to dispatch
 * @return {Object} new state
 */
export default (state = initialState, action) => {
	if (!action.isAction) { // TODO: remove when we use new style action everywhere
		return state;
	}

	if (!action.isUndoable || !action.isUndoable()) {
		return state;
	}

	return Object.assign({}, state, { history: [...state.history, action] });
};
