import { applyMiddleware, createStore } from "redux";
import { apiMiddleware } from "redux-api-middleware-plain-object";
import { logger } from "redux-logger";
import reducers from "./reducers";

const middlewareParameters = [apiMiddleware];

// eslint-disable-next-line no-process-env
if (process.env.NODE_ENV !== "production") {
	middlewareParameters.push(logger);
}

export const store = createStore(
	reducers,
	applyMiddleware(...middlewareParameters)
);
