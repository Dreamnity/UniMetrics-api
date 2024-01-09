const db = require("../../lib/database");
/**
 *
 * @param {URL} url
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse<import('http').IncomingMessage>} res
 * @returns
 */
module.exports = (url, req, res) => {
	const addr = req.socket.address().address;
	if (db.get(url.searchParams.get("token"), "author") === addr) {
		res.writeHead(403);
		return "Error: Variable can only be deleted by the account owner";
	}
	return db.createAccount({ author: addr, __historyLimit: 30 });
};
