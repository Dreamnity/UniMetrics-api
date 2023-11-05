const fs = require("fs");
const yaml = require("yaml");
const dbpath = require("path/posix").join(__dirname, "..", "database.yaml");
const db = yaml.parse(fs.readFileSync(dbpath).toString()) || {};
module.exports = {
	createAccount(info) {
		const token = genToken();
		db[token] = {
			...info,
		};
		return save(token);
	},
  deleteAccount(token) {
    validateAcc(token);
		return save(delete db[token]);
	},
	createVariable(token, name) {
		validateAcc(token);
    validateVarName(name);
    if (db[token][name]) throw "Variable already exists";
    db[token][name] = joinBits([0]);
		return save();
	},
	deleteVariable(token, name) {
    validateAcc(token);
    validateVarName(name);
		return save(delete db[token][name]);
	},
	append(token,key, value) {
    validateAcc(token);
    validateVarName(key);
    validateValue(value);
    var dat = splitBits(db[token][key]);
    dat.push(value);
    if (dat.length > db[token].__historyLimit) {
      dat = dat.splice(0, dat.length - db[token].__historyLimit);
    }
    db[token][key] = joinBits(dat);
    return save();
  },
  get(token,key) {
    validateAcc(token);
    validateVarName(key);
    return splitBits(db[token][key]);
  },
  queryByInfo(key, value) {
		return Object.values(db).find(e => e[key] === value);
	},
	/*get(token, byteNumber) {
		return splitBits(db[token])[byteNumber];
	},
	create(info) {
		const token = genToken();
		db[token] = {
			data: joinBits([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
			...info,
		};
		save();
		return token;
	},
	queryByInfo(key, value) {
		return Object.values(db).find(e => e[key] === value);
	},
	getInfo(token) {
		return db[token];
	},
	set(token, idx, byteNumber, data) {
		if (typeof data !== "number" || data < -32768 || data > 32767)
			throw new TypeError("Expected 16-bit signed int");
		const dat = splitBits(db[token].data);
		dat[byteNumber] = data;
		db[token].data = joinBits(dat);
		save();
	}*/
};
/**
 *
 * @param {String} bits base64
 * @returns {Number[]}
 */
function splitBits(bits) {
	return Buffer.from(bits, "base64url")
		.toString("hex")
		.match(/.{0,4}/g)
		.slice(0, -1)
		.map(e => parseInt(e, 16) - 32768);
}
/**
 *
 * @param {Number[]} bitsArray
 * @returns {String} base64
 */
function joinBits(bitsArray) {
	return Buffer.from(
		bitsArray.map(e => (e + 32768).toString(16).padStart(2, "0")).join(""),
		"hex"
	).toString("base64url");
}

function genToken() {
	return Buffer.from((Date.now() + Math.random() * 100).toString(32)).toString(
		"base64url"
	);
}
function save(passthrough) {
	fs.writeFile(dbpath, yaml.stringify(db), () => {});
	return passthrough;
}
function validateAcc(token) {
	if (!db[token]) throw "Invalid token";
}
function validateVarName(name) {
	try {
		const test = {};
		test[name] = "hello world";
	} catch {
		throw "Invalid variable name";
	}
}
function validateValue(value) {
  if (typeof value !== "number" || value < -32768 || value > 32767)
    throw new TypeError("Expected 16-bit signed int");
}