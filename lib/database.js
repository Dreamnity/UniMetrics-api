const fs = require("fs");
const yaml = require("yaml");
const dbpath = require("path/posix").join(__dirname, "..", "database.yaml");
/**
 * @type {{__inactiveTime: BigInt,__author: string, __historyLimit: number}[]}
 */
var db = yaml.parse(fs.readFileSync(dbpath).toString()) || {};
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
	append(token, key, value) {
		validateAcc(token);
		validateVarName(key);
		validateVar(token, key);
		validateValue(value);
		var dat = splitBits(db[token][key]);
		dat.push(value + 32768);
		while (dat.length > db[token].__historyLimit) dat.shift();
		db[token][key] = joinBits(dat);
		db[token].__lastAccessed = Date.now();
		return save();
	},
	get(token, key) {
		validateAcc(token);
		validateVarName(key);
		validateVar(token, key);
		db[token].__lastAccessed = Date.now();
		return splitBits(db[token][key]);
	},
	setInfo(token, key, value) {
		validateAcc(token);
		validateVarName(key);
		db[token][key] = value;
		return save();
	},
	getInfo(token, key) {
		validateAcc(token);
		validateVarName(key);
		return db[token][key];
	},
	queryByInfo(key, value) {
		return Object.values(db).find(e => e[key] === value);
	},
	listVariables(token) {
		validateAcc(token);
		return Object.keys(db[token]).filter(e => validateVarInternal(token, e));
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
function validateVar(token, varname) {
	if (!db[token][varname]) throw "Invalid variable(404)";
	try {
		splitBits(db[token][varname]);
	} catch {
		throw "Invalid variable(403)";
	}
}
function validateVarInternal(token, varname) {
	if (!db[token][varname]) return false;
	try {
		splitBits(db[token][varname]);
		return true;
	} catch {
		return false;
	}
}
function validateVarName(name) {
  if(!name) throw "Invalid variable name";
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
//cleanup
setInterval(() => {
	Object.keys(db).forEach(e => {
		if (Date.now() > db[e].__lastAccessed + db[e].__inactiveTime) {
			delete db[e];
      save();
		}
	});
},10000);
