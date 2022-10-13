/**
 * Handle all uncaught server-side errors
 */

module.exports = function handleErrors(error, req, res, next) { // eslint-disable-line max-params,no-unused-vars
	if (error.name === "HideRouteError") {
		return res.sendStatus(404);
	}

	console.error(error); // eslint-disable-line no-console

	return res.status(error.status || 500).json({ error: error.message });
};
