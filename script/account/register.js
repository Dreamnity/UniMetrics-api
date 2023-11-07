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
	if (db.queryByInfo("author", addr)) {
		res.writeHead(409);
		return "Error: Already registered";
	}
	return db.createAccount({
		author: addr,
		__historyLimit: 30,
    __inactiveTime: 2592000000,
    __lastAccessed: Date.now()
	});
};
