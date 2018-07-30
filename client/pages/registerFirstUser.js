import { ControlLabel, FormControl, FormGroup, HelpBlock } from "react-bootstrap";
import PropTypes from "prop-types";
import React from "react";

export default class RegisterFirstUser extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			value: ""
		};
	}

	getValidationState() {
		const { length } = this.state.value;
		if (length > 10) {
			return "success";
		} else if (length > 5) {
			return "warning";
		} else if (length > 0) {
			return "error";
		}
		return null;
	}

	handleChange(event) {
		this.setState({ value: event.target.value });
	}

	render() {
		return (
			<div className="register-first-user">
				<h2>Add first user</h2>
				<p>It looks like this is the first time you run this application.
					In order to function properly, a super user account is required, thus
					you are invited to create one now using the following form.</p>

				<form>
					<FormGroup
						controlId="formBasicText"
						validationState={this.getValidationState()}
					>
						<ControlLabel>Working example with validation</ControlLabel>
						<FormControl
							type="text"
							value={this.state.value}
							placeholder="Enter text"
							onChange={this.handleChange}
						/>
						<FormControl.Feedback/>
						<HelpBlock>Validation is based on string length.</HelpBlock>
					</FormGroup>
				</form>
			</div>
		);
	}
}

RegisterFirstUser.propTypes = {
	registerUser: PropTypes.func.isRequired
};

