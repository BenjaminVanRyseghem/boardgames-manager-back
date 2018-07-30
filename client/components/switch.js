import BootstrapSwitch from "react-bootstrap-switch";
import { ControlLabel } from "react-bootstrap";
import PropTypes from "prop-types";
import React from "react";

export default class Switch extends React.Component {
	render() {
		return (
			<div className="switch">
				<BootstrapSwitch
					bsSize="mini"
					inverse
					value={this.props.value}
					onChange={this.props.onChange}
					{...this.props}
				/>
				<ControlLabel>{this.props.text}</ControlLabel>
			</div>
		);
	}
}

Switch.propTypes = {
	value: PropTypes.bool.isRequired,
	onChange: PropTypes.func.isRequired,
	text: PropTypes.string.isRequired
};
