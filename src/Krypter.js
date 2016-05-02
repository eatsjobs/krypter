/**
 * A module for sign and verify plaintext and javascript object with Web Cryptographic API
 * At the moment only sign and verify is provided.
 * @module src/Krypter
 * @version 1.0.0
 * @author pasquale mangialavori aka eatsjobs
 */

var Utils = require("./Utils");

var _crypto = window.crypto || window.msCrypto;
var subtle;

// Chrome
if(window.crypto && window.crypto.subtle){
	subtle = window.crypto.subtle;
// MS
} else if (window.msCrypto && window.msCrypto.subtle){
	subtle = window.msCrypto.subtle;
// Safari		
} else if (window.crypto && window.crypto.webkitSubtle){
	subtle = window.crypto.webkitSubtle;
// Unsupported
} else {
	subtle = null;
}

/**
 * Decorator function: if Cryptographic is not supported from the browser throws an Error
 * @private
 * @param {Function} fn - the function to decorate
 * @param {Object} [context=null] - the optional this-context. default to null
 * @throws {Error}
 * @returns {Function} 
 */
function requireCryptoDefined(fn, context){ 
	return function(){
		if(subtle){
			return fn.apply(context || null, arguments); 
		} else {
			throw new Error("HTML5 WebCrypto not supported in this Browser");
		}
	};
}

/**
 * TODO:Implement encrypt and decrypt function
 */
var initialVector = _crypto.getRandomValues(new Uint8Array(16));

var RSA256 = {name: "RSASSA-PKCS1-v1_5", hash: {name: "SHA-256"}};
var AESalgo = {name: "AES-CBC", length: 128, iv: initialVector};

var algorithms = {RSA256: RSA256, AES128: AESalgo};

/**
* @constructor
* @alias module:src/Krypter
* */
function Krypter() {}

/**
 * The function to sign a textplain or an object
 * @throws {Error}
 * @param {String|Object} text - An object or a string to sign
 * @param {JWK} JWKPrivateKey - the jwk private key to load as CryptoKey object
 * @param {String} algoName - RSA256|AES128 possible values
 * @returns {Promise<String>} - the signature in base64 format
 */
Krypter.prototype.sign = function (text, JWKPrivateKey, algoName) {
	
	if (typeof text == "object") {
		text = JSON.stringify(text);
	}
	
	function s(cryptoKey){
		if (algorithms.hasOwnProperty(algoName)) {
			return subtle.sign(algorithms[algoName], cryptoKey, Utils.str2ab(text))
				.then(Utils.abtob64);
		}
	}

	return loadKey(JWKPrivateKey, "private", algoName).then(s);
};

/**
 * The function to verify a signature
 * @throws {Error}
 * @param {String|Object} text - a text or an object
 * @param {ArrayBuffer} signature - the signature to verify
 * @param {JWK} JWKPublicKey -
 * @param {String} algoName - example RSA256 or AES128 as possible values
 * @returns {Promise<Boolean>} the result of verification
 */
Krypter.prototype.verify = function (text, signature, JWKPublicKey, algoName) {

	if (typeof text == "object") {
		text = JSON.stringify(text);
	}

	return loadKey(JWKPublicKey, "public", algoName).then(function (cryptoKey) {
		if (algorithms.hasOwnProperty(algoName)) {
			return subtle.verify(algorithms[algoName], cryptoKey, Utils.b64toab(signature), Utils.str2ab(text));
		}
	});
};

/**
 * Load key function
 * @private
 * @param {JWK} key - in Javascript Web Key format
 * @param {String} privateOrPublic - 'private' and 'public' are the possible values
 * @param {String} algoName - the algo label name for example 'RSA256'
 * @returns {Promise}
 * */
function loadKey(key, privateOrPublic, algoName) {

	var usages;
	if (privateOrPublic == "private") {
		usages = ["sign"];
	} else {
		usages = ["verify"];
	}

	return subtle.importKey("jwk", key, algorithms[algoName], true, usages);
}

/**
 * Generate the KeyPairs for asymmetric encryption
 * @throws {Error}
 * @returns {Promise<Object>} fullfilled with keys.privateJWK, keys.publicJWK
 */
Krypter.prototype.generateKeyPairs = function() {

	var generator = subtle.generateKey({
		name: "RSASSA-PKCS1-v1_5",
		modulusLength: 2048,
		publicExponent: new Uint8Array([1, 0, 1]),
		hash: {name: "SHA-256"}
	},
	true,
	["sign", "verify"]);

	return generator.then(function (keys) {
		// Object with exported promises
		return Promise.all([
			subtle.exportKey("jwk", keys.privateKey),
			subtle.exportKey("jwk", keys.publicKey)
		]);
	}).then(function(results){
		return {
			private:results[0],
			public:results[1]
		};
	});
};

// Override with the Decorator
Krypter.prototype.sign = requireCryptoDefined(Krypter.prototype.sign, Krypter.prototype);
Krypter.prototype.verify = requireCryptoDefined(Krypter.prototype.verify, Krypter.prototype);
Krypter.prototype.generateKeyPairs = requireCryptoDefined(Krypter.prototype.generateKeyPairs, Krypter.prototype);

// CommonJS exports
module.exports = new Krypter;