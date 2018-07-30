import { Route, Switch } from "react-router-dom";
import Footer from "./footer";
import Home from "../pages/home";
import PropTypes from "prop-types";
import React from "react";
import RegisterFirstUser from "../pages/registerFirstUser";

export default class App extends React.Component {
	renderContent() {
		if (!this.props.hasUsers) {
			return <RegisterFirstUser/>;
		}

		return (
			<Switch>
				<Route path="/" render={() => <Home {...this.props}/>}/>
			</Switch>
		);
	}

	render() {
		return (
			<div className="app">
				<div className="outer-wrapper">
					<div className="inner-wrapper">
						{this.renderContent()}
					</div>
				</div>
				<Footer/>
			</div>
		);
	}
}

App.propTypes = {
	hasUsers: PropTypes.bool.isRequired
};
