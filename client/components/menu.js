import { Checkbox, ControlLabel, FormControl, FormGroup, HelpBlock } from "react-bootstrap";
import InputRange from "react-input-range";
import PropTypes from "prop-types";
import React from "react";
import Switch from "./switch";

const DELAY = 500;
const updatableKeys = ["numberOfPlayers", "name"];
const defaults = {
	name: "",
	numberOfPlayers: 2
};

export default class Menu extends React.Component {
	constructor(...args) {
		super(...args);

		this.timeout = null;

		this.state = {
			numberOfPlayers: null,
			name: null,
			numberOfPlayersFilter: false
		};
	}

	buildFilters() {
		let result = {};
		updatableKeys.forEach((name) => {
			let state = this.getStateFor(name);
			if (state === null) {
				return;
			}

			result[name] = state;
		});

		return result;
	}

	getStateFor(key, state = this.state) {
		if (!state[`${key}Filter`]) {
			return null;
		}

		return state[key] || defaults[key];
	}

	componentDidUpdate(prevProps, prevState) {
		updatableKeys.forEach((key) => {
			let state = this.getStateFor(key);
			if (state !== this.getStateFor(key, prevState)) {
				if (this.timeout) {
					clearTimeout(this.timeout);
				}

				this.timeout = setTimeout(() => {
					this.props.getAllGames(this.buildFilters());
				}, DELAY);
			}
		});
	}

	changeName(event) {
		this.setState({ name: event.target.value || false });
	}

	numberOfPlayersFilter(elem, numberOfPlayersFilter) {
		this.setState({ numberOfPlayersFilter });
	}

	render() {
		return (
			<form className="form">
				{/* <InputRange*/}
				{/* maxValue={10}*/}
				{/* minValue={1}*/}
				{/* value={this.state.numberOfPlayers}*/}
				{/* onChange={(numberOfPlayers) => this.setState({ numberOfPlayers })}*/}
				{/* />*/}
				{/* <label>*/}
				{/* Name:*/}
				{/* <input type="text" value={this.state.name || ""} onChange={this.changeName.bind(this)}/>*/}
				{/* </label>*/}

				<FormGroup
					controlId="numberOfPlayer"
				>
					<Switch
						value={this.state.numberOfPlayersFilter}
						onChange={this.numberOfPlayersFilter.bind(this)}
						text="Number of Players"
					/>
					<InputRange
						disabled={!this.state.numberOfPlayersFilter}
						maxValue={10}
						minValue={1}
						value={this.state.numberOfPlayers || defaults.numberOfPlayers}
						onChange={(numberOfPlayers) => this.setState({ numberOfPlayers })}
					/>
				</FormGroup>
			</form>
		);
	}
}

Menu.propTypes = {
	getAllGames: PropTypes.func.isRequired
};
