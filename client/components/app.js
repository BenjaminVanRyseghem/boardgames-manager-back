import { Route, Switch } from "react-router-dom";
import Home from "../pages/home";
import PropTypes from "prop-types";
import React from "react";

export default class App extends React.Component {
	render() {
		return (
			<Switch>
				<Route path="/" render={() => <Home {...this.props}/>}/>
			</Switch>
		);
	}
}

App.propTypes = {
	undoHistory: PropTypes.array.isRequired
};
