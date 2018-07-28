import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InputRange from "react-input-range";
import Loading from "../components/loading";
import PropTypes from "prop-types";
import React from "react";

const DELAY = 500;

export default class Home extends React.Component {
	constructor(...args) {
		super(...args);

		this.timeout = null;

		this.state = {
			numberOfPlayers: 2,
			name: false
		};
	}

	buildFilters() {
		let result = {};
		Object.keys(this.state).forEach((name) => {
			if (this.state[name] === false) {
				return;
			}

			result[name] = this.state[name];
		});

		return result;
	}

	componentDidUpdate(prevProps, prevState) {
		let keys = ["numberOfPlayers", "name"];

		keys.forEach((key) => {
			if (prevState[key] !== this.state[key]) {
				if (this.timeout) {
					clearTimeout(this.timeout);
				}

				this.timeout = setTimeout(() => {
					this.props.getAllGames(this.buildFilters());
				}, DELAY);
			}
		});
	}

	componentDidMount() {
		this.props.getAllGames(this.buildFilters());
	}

	changeName(event) {
		this.setState({ name: event.target.value || false });
	}

	renderMenu() {
		return (
			<form className="form">
				<InputRange
					maxValue={10}
					minValue={1}
					value={this.state.numberOfPlayers}
					onChange={(numberOfPlayers) => this.setState({ numberOfPlayers })}
				/>
				<label>
					Name:
					<input type="text" value={this.state.name || ""} onChange={this.changeName.bind(this)}/>
				</label>
			</form>
		);
	}

	renderInfo(rawIcon, text, shouldRender = true) {
		let icon = rawIcon;
		if (!shouldRender) {
			return null;
		}

		if (typeof icon === "string") {
			icon = <FontAwesomeIcon icon={icon}/>;
		}

		return (
			<div className="info">
				{icon}
				<span>{text}</span>
			</div>
		);
	}

	renderTags({ hasTags, game }) {
		if (!hasTags) {
			return null;
		}

		return (
			<div className="line">
				{this.renderInfo("tags", `${game.tags.sort().join(", ")}`)}
			</div>
		);
	}

	renderGame(game) {
		let hasTags = game.tags.length;

		return (
			// eslint-disable-next-line no-underscore-dangle
			<li className="game" key={game._id}>
				<div className="image">
					<img src={game.picture} alt={`Box of the ${game.name}`}/>
				</div>
				<div className="summary">
					<div className="name">{game.name}</div>
					<div className={`info-bar${hasTags ? "" : " no-tags"}`}>
						<div className="group">
							<div className="line">
								{this.renderInfo("chess-pawn", `${game.playersMin}-${game.playersMax}`)}
								{this.renderInfo("stopwatch", `${game.time}'`)}
								{this.renderInfo("box", game.box)}
							</div>
							{this.renderTags({
								hasTags,
								game
							})}
						</div>
						<span className="group stack float-right">
							{this.renderInfo("industry", game.publisher)}
							{this.renderInfo("door-open", game.lent, game.lent)}
						</span>
					</div>
					<div className="description">TODO</div>
				</div>
			</li>
		);
	}

	renderContent() {
		if (!this.props.games.length) {
			return "No game found";
		}

		return (
			<ul className="games">
				{this.props.games.map((game) => this.renderGame(game))}
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
					{this.renderMenu()}
				</div>
				<div className="content">
					{this.renderContent()}
				</div>
				<div className="footer">
					<div className="punchline">
						Provided with <FontAwesomeIcon icon="heart"/> by <span className="font-weight-bold">Benjamin Van Ryseghem</span>
					</div>
				</div>
			</div>
		);
	}
}

Home.propTypes = {
	games: PropTypes.array,
	getAllGames: PropTypes.func.isRequired
};

