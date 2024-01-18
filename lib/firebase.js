const admin = require("firebase-admin/app");
const auth = require("firebase-admin/auth");
var serviceAccount = require("../secrets/serviceAccountKey.json");
const app = admin.initializeApp({
	credential: admin.cert(serviceAccount),
	databaseURL:
		"https://dreamnity-unimetrics-default-rtdb.asia-southeast1.firebasedatabase.app",
});
module.exports = { app, auth };
