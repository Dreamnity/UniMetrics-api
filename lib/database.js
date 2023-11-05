const fs = require("fs");
const yaml = require("yaml");
const dbpath = require("path/posix").join(__dirname, "..", "database.yaml");
const db = yaml.parse(fs.readFileSync(dbpath).toString()) || {};
module.exports = {
	get(token, byteNumber) {
		return splitBits(db[token])[byteNumber];
	},
	create() {
		const token = genToken();
		db[token] = joinBits([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
		save();
		return token;
	},
	set(token, byteNumber, data) {
		if (typeof data !== "number" || data < 0 || data > 255)
			throw new TypeError("Expected 8-bit number");
		const dat = splitBits(db[token]);
		dat[byteNumber] = data;
		db[token] = joinBits(dat);
		save();
	},
};
/**
 *
 * @param {String} bits base64
 * @returns {Number[]}
 */
function splitBits(bits) {
	return Buffer.from(bits, "base64url")
		.toString("hex")
		.match(/.{0,2}/g)
		.slice(0, -1)
		.map(e => parseInt(e, 16));
}
/**
 *
 * @param {Number[]} bitsArray
 * @returns {String} base64
 */
function joinBits(bitsArray) {
	return Buffer.from(
		bitsArray.map(e => e.toString(16).padStart(2, "0")).join(""),
		"hex"
	).toString("base64url");
}

function genToken() {
	return Buffer.from((Date.now() + Math.random() * 100).toString(32)).toString(
		"base64url"
	);
}
function save() {
	fs.writeFile(dbpath, yaml.stringify(db), () => {});
}
