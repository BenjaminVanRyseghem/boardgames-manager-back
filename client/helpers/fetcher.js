import { CALL_API, RSAA } from "redux-api-middleware-plain-object";
import { store } from "../store";

const validKeys = ["type", "payload", "meta"];

/*
 * Todo: Extract
 */
const API_CONNECT = {
	url: "",
	contentType: "application/json"
};

let formatReceivedData = (data) => data;
let formatReceivedHeaders = (data) => data;

/**
 * TODO
 * @param {string} url - URL to use
 */
export function setUrl(url) {
	API_CONNECT.url = url;
}

/**
 * TODO
 * @return {Object} - result of the api with the object that contains type and payload
 */
const sendRequest = ({ action, headers }) => {
	const params = {};

	params.method = action.method();
	params.endpoint = API_CONNECT.url + action.endpoint();
	params.headers = Object.assign(
		{},
		headers,
		{
			"Content-Type": API_CONNECT.contentType
		}
	);

	let RequestAction = action.actions().request;
	let SuccessAction = action.actions().success;
	let FailureAction = action.actions().failure;

	params.types = [
		new RequestAction({ payload: ({ [RSAA]: { endpoint } }) => ({ endpoint }) }),
		new SuccessAction({
			payload: (__, state, res) => res.json().then((data) => ({
				data: formatReceivedData(data),
				headers: formatReceivedHeaders(res.headers)
			}))
		}),
		new FailureAction({
			meta: (__, state, res) => (res
				? {
					status: res.status,
					statusText: res.statusText
				}
				: {
					status: "Network request failed"
				})
		})
	];

	// Hide stuff to pass Redux check :smile:
	params.types.forEach((type) => {
		for (let key in type) {
			if (validKeys.indexOf(key) === -1) {
				Object.defineProperty(type, key, { enumerable: false });
			}
		}
	});

	if (action.body()) {
		params.body = JSON.stringify(action.body());
	}

	return { [CALL_API]: params };
};

/**
 * Function that find the user token and send a request to the api
 * @param {Object} data - object that contains the parameters to send a request with the JWToken
 */
export const requestApi = (data) => {
	let options = {
		action: data,
		headers: data.headers()
	};

	try {
		let action = sendRequest(options);
		store.dispatch(action);
	} catch (err) {
		// eslint-disable-next-line no-debugger
		debugger;

		/*
		 * return store.dispatch({
		 * 	type: Constants.TOKEN.TOKEN_FAILED,
		 * 	error: err
		 * });
		 */
	}
};
