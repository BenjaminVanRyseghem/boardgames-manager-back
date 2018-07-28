import { getAllGames, getAllPublishers } from "../actions/api/games";
import App from "../components/app";
import { connect } from "react-redux";
import { HashRouter } from "react-router-dom";
import Loading from "../components/loading";
import PropTypes from "prop-types";
import React from "react";

class AppContainer extends React.Component {
	componentDidMount() {
		let { publishers } = this.props;

		if (!publishers) {
			this.props.getAllPublishers();
		}
	}

	render() {
		if (!this.props.publishers) {
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
	undoHistory: PropTypes.array.isRequired,
	getAllGames: PropTypes.func.isRequired,
	getAllPublishers: PropTypes.func.isRequired
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
	getAllPublishers
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AppContainer);
