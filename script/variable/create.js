const db = require("../../lib/database");
/**
 *
 * @param {URL} url
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse<import('http').IncomingMessage>} res
 * @returns
 */
module.exports = (url, req, res) => { 
  db.createVariable(url.searchParams.get("token"), url.searchParams.get("name"));
  return 'ok'
}