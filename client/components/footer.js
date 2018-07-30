import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default class Footer extends React.PureComponent {
	render() {
		return (
			<div className="footer">
				<div className="punchline">
					Provided with <FontAwesomeIcon icon="heart"/> by <span className="font-weight-bold">Benjamin Van Ryseghem</span>
				</div>
			</div>
		);
	}
}

Footer.propTypes = {};
