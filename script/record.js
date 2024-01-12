const db = require("../lib/database");
/**
 *
 * @param {URL} url
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse<import('http').IncomingMessage>} res
 * @param {import('ws').WebSocketServer} server
 * @returns
 */
module.exports = (url, req, res, server) => {
  const token = url.searchParams.get("token");
  const name = url.searchParams.get("var");
  const value = parseInt(url.searchParams.get("value"));
	db.append(
		token,
		name,
		value
  );
  server.clients.forEach(
		ws =>
			ws.param.token === token &&
			(ws.param.name === name || !ws.param.name) &&
			ws.send(name + ":" + value)
	);
  return 'ok'
};
