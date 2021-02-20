const dbBuilder = require("../helpers/dbBuilder");

let { exports: publishers } = dbBuilder("publishers", []);

/**
 * @swagger
 *  components:
 *    schemas:
 *      Publisher:
 *        type: object
 *        required:
 *          - id
 *          - foreignId
 *          - name
 *        properties:
 *          id:
 *            type: string
 *          foreignId:
 *            type: string
 *          name:
 *            type: string
 *        example:
 *           id: "b50797f0-fa61-407f-9f45-48b5db6257ac"
 *           foreignId: "b50797f0-fa61-407f-9f45-48b5db6257ac"
 *           name: "Asmodee"
 */

module.exports = publishers;
