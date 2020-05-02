const dbBuilder = require("../helpers/dbBuilder");

let { exports: publishers } = dbBuilder("publishers", [
	{
		id: "1",
		foreignId: 108,
		value: "Gamewright"
	}
]);

/**
 * @swagger
 *  components:
 *    schemas:
 *      Publisher:
 *        type: object
 *        required:
 *          - id
 *          - foreignId
 *          - value
 *        properties:
 *          id:
 *            type: string
 *          name:
 *            foreignId: string
 *          value:
 *            type: string
 *        example:
 *           id: "b50797f0-fa61-407f-9f45-48b5db6257ac"
 *           foreignId: "b50797f0-fa61-407f-9f45-48b5db6257ac"
 *           value: "Asmodee"
 */

module.exports = publishers;
