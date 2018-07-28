import { combineReducers } from "redux";

import games from "./reducers/games";
import undo from "./reducers/undo";

export default combineReducers({
	games,
	undo
});
