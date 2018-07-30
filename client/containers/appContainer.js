import { getAllGames, getAllPublishers } from "../actions/api/games";
import App from "../components/app";
import { connect } from "react-redux";
import { getHasUsers } from "../actions/api/users";
import { HashRouter } from "react-router-dom";
import Loading from "../components/loading";
import PropTypes from "prop-types";
import React from "react";

class AppContainer extends React.Component {
	componentDidMount() {
		let { publishers, hasUsers } = this.props;

		if (!publishers) {
			this.props.getAllPublishers();
		}

		if (!hasUsers) {
			this.props.getHasUsers();
		}
	}

	render() {
		if (!this.props.publishers || this.props.hasUsers === null) {
			return <Loading/>;
		}

		return (
			<HashRouter>
				<App {...this.props}/>
			</HashRouter>
		);
	}
}

AppContainer.propTypes = {
	publishers: PropTypes.array,
	hasUsers: PropTypes.bool,
	getAllPublishers: PropTypes.func.isRequired,
	getHasUsers: PropTypes.func.isRequired
};

const mapStateToProps = ({
	games: {
		games,
		publishers
	},
	undo: { history }
}) => ({
	games,
	publishers,
	undoHistory: history
});

const mapDispatchToProps = () => ({
	getAllGames,
	getAllPublishers,
	getHasUsers
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AppContainer);
