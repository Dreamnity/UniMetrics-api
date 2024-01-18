const firebase = require("../../lib/firebase");
const db = require("../../lib/database");
/**
 *
 * @param {URL} url
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse<import('http').IncomingMessage>} res
 * @returns
 */
module.exports = (url, req, res) => {
  const token = url.searchParams.get("token");
	if (!token) throw new Error("No token provided");
	return firebase.auth
		.getAuth(firebase.app)
		.verifyIdToken(token)
		.then(decodedToken => {
			const uid = decodedToken.uid;
			const token = db.queryNameByInfo("uid", uid);
			if (token) return token;
			else throw new Error("Invalid token.");
		})
		.catch(error => {
			throw new Error("Firebase Error: " + error.message);
		});
};
