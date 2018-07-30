import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Game from "../components/game";
import Loading from "../components/loading";
import Menu from "../components/menu";
import PropTypes from "prop-types";
import React from "react";
import Footer from "../components/footer";

export default class Home extends React.Component {
	componentDidMount() {
		this.props.getAllGames();
	}

	renderContent() {
		if (!this.props.games.length) {
			return "No game found";
		}

		// eslint-disable-next-line no-underscore-dangle
		return (
			<ul className="games">
				{this.props.games.map((game) => {
					// eslint-disable-next-line no-underscore-dangle
					let id = game._id;
					return <li className="game" key={id}><Game game={game}/></li>;
				})}
			</ul>
		);
	}

	render() {
		if (!this.props.games) {
			return <Loading/>;
		}

		return (
			<div className="home">
				<div className="menu">
					<Menu getAllGames={this.props.getAllGames}/>
				</div>
				<div className="content">
					{this.renderContent()}
				</div>
			</div>
		);
	}
}

Home.propTypes = {
	games: PropTypes.array,
	getAllGames: PropTypes.func.isRequired
};

