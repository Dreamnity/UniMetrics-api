const db = require('../lib/database');
module.exports = (url, req, res) => {
	const addr = req.socket.address().address;
	if (db.queryByInfo("author", addr)) {
		res.writeHead(409);
		return "Error: Already registered";
	}
	return db.createAccount({ author: addr, __historyLimit:30 });
};