import { Form as ReactForm, Text } from "react-form";
import PropTypes from "prop-types";
import React from "react";

const nextId = (() => {
	let id = 0;
	return () => id++;
})();

const hasError = (formApi, name) => formApi.errors && formApi.errors[name];

const renderError = (formApi, name) => {
	if (!hasError(formApi, name)) {
		return null;
	}

	return (
		<div className="help-text">
			{formApi.errors[name]}
		</div>
	);
};

const errorCssClass = (formApi, name) => (hasError(formApi, name) ? "has-validation-error" : "");

export class Form extends React.Component {
	constructor(props) {
		super(props);

		this.id = nextId();
	}

	renderChildren(formApi) {
		if (this.props.children.constructor !== Array) {
			return React.cloneElement(this.props.children, { formApi });
		}

		return this.props.children.map((child) => React.cloneElement(child, { formApi }));
	}

	render() {
		return (
			<ReactForm onSubmit={this.props.onSubmit}>
				{(formApi) => (
					<form
						id={this.props.id || false}
						className={`form-builder${this.props.inline ? " inline" : ""}`}
						onSubmit={formApi.submitForm}
					>
						{this.renderChildren(formApi)}
						<div className="form-footer">
							<button type="submit" className="mb-4 btn btn-primary">
								{this.props.submitLabel}
							</button>
						</div>
					</form>
				)}
			</ReactForm>
		);
	}
}

Form.defaultProps = {
	inline: false,
	submitLabel: "Submit"
};

Form.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	]),
	id: PropTypes.string,
	inline: PropTypes.bool,
	onSubmit: PropTypes.func.isRequired,
	submitLabel: PropTypes.string
};

export class Password extends React.Component {
	constructor(props) {
		super(props);

		this.id = nextId();
	}

	confirmValidate(input) {
		if (input !== this.input) {
			return {
				error: "Password mismatch"
			};
		}

		return {
			success: null
		};
	}

	renderConfirmation() {
		if (!this.props.withConfirmation) {
			return null;
		}

		let id = `password-confirmation-${this.id}`;

		return (
			<fieldset className={errorCssClass(this.props.formApi, id)}>
				<label htmlFor={`text-input-${id}`}>{this.props.confirmationLabel}</label>
				<Text
					validate={this.confirmValidate.bind(this)}
					type="password"
					field={id}
					id={`text-input-${id}`}
				/>
				{renderError(this.props.formApi, id)}
			</fieldset>
		);
	}

	validate(input) {
		this.input = input;
		if (!input || input.length <= 32) {
			return { error: "Password too short" };
		}

		return {
			success: null
		};
	}

	render() {
		let id = `password-${this.id}`;
		return (
			<fieldset>
				<fieldset className={errorCssClass(this.props.formApi, id)}>
					<label htmlFor={`text-input-${id}`}>{this.props.label}</label>
					<Text
						validate={this.validate.bind(this)}
						type="password"
						field={id}
						id={`text-input-${id}`}
					/>
					{renderError(this.props.formApi, id)}
				</fieldset>
				{this.renderConfirmation(id)}
			</fieldset>
		);
	}
}

Password.propTypes = {
	withConfirmation: PropTypes.bool,
	label: PropTypes.string,
	confirmationLabel: PropTypes.string,
	formApi: PropTypes.object
};

Password.defaultProps = {
	withConfirmation: false,
	label: "Password",
	confirmationLabel: "Password confirmation"
};
