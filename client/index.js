import "../styles/main.scss";

import AppContainer from "./containers/appContainer";
import { fas as fontAwesome } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import { Provider } from "react-redux";
import React from "react";
import ReactDOM from "react-dom";
import { setUrl } from "./helpers/fetcher";
import { store } from "./store";

library.add(fontAwesome);

export default class BoPlacement {
	constructor({
		restUrl = "/api",
		container
	}) {
		setUrl(restUrl);
		this._container = container;
	}

	render() {
		let root = (
			<Provider store={store}>
				<AppContainer/>
			</Provider>
		);

		ReactDOM.render(root, this._container);
	}
}

module.exports = BoPlacement;
