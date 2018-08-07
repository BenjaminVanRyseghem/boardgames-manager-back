import { ControlLabel, FormControl, FormGroup, HelpBlock } from "react-bootstrap";
import PropTypes from "prop-types";
import React from "react";
import { Form, Password } from "../lib/formBuilder";

export default class RegisterFirstUser extends React.PureComponent {
	getValidationState() {
		const { length } = this.state.name;
		if (length > 10) {
			return "success";
		} else if (length > 5) {
			return "warning";
		} else if (length > 0) {
			return "error";
		}
		return null;
	}

	render() {
		return (
			<div className="register-first-user">
				<h2>Add first user</h2>
				<p>It looks like this is the first time you run this application.
					In order to function properly, a super user account is required, thus
					you are invited to create one now using the following form.</p>

				<Form onSubmit={() => { debugger; }}>
					<Password withConfirmation/>
				</Form>
			</div>
		);
	}
}

RegisterFirstUser.propTypes = {
	registerUser: PropTypes.func.isRequired
};

