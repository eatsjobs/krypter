/**
 * A module for sign and verify plaintext and javascript object with Web Cryptographic API
 * At the moment only sign and verify is provided. But it will be possible to encrypt and decrypt
 * and wrap symmetric key with asymmetric ones.
 * @class Krypter
 * @version 1.0.0
 */
(function (root) {

	var RSA256 = {name: "RSASSA-PKCS1-v1_5", hash: {name: "SHA-256"}}; // must be the same
	var AESalgo = {name: "AES-CBC", length: 128, iv: initialVector};

	var crypto = root.crypto || root.msCrypto || root.crypto.webkitSubtle;

	if (crypto === undefined) {
		throw new Error("HTML5 WebCrypto not supported in this Browser");
	}
	/**
	 *   TODO:Implement encrypt and decrypt function
	 */
	var initialVector = crypto.getRandomValues(new Uint8Array(16));

	function decorate(fn, fn2) {
		return function () {
			return fn(fn2.apply(null, arguments));
		};
	}

	var algorithms = {RSA256: RSA256, AES128: AESalgo};

	/**
	* @constructor
	* */
	function Krypter() {}

	/**
	 * The function to sign a textplain or an object
	 * @memberOf Krypter
	 * @param {String|Object} text - An object or a string to sign
	 * @param {JWK} JWKPrivateKey - the jwk private key to load as CryptoKey object
	 * @param {String} algoName - RSA256 for example or AES128
	 * @param {Function} saveSignature - the callback to call with the digital base64 signature
	 */
	Krypter.prototype.sign = function (text, JWKPrivateKey, algoName, saveSignature) {
		var saveSignatureDecoratedFn = decorate(saveSignature, _abtob64);

		if (typeof text == "object") {
			text = JSON.stringify(text);
		}

		var self = this;
		loadKey(JWKPrivateKey, "private", algoName).then(function (cryptoKey) {
			if (algorithms.hasOwnProperty(algoName)) {
				crypto.subtle.sign(algorithms[algoName], cryptoKey, self.str2ab(text))
					.then(saveSignatureDecoratedFn);
			}
		});
	};

	/**
	 * The function to verify a signature
	 * @memberOf Krypter
	 * @param {String|Object} text
	 * @param {ArrayBuffer} signature - the signature to verify
	 * @param {JWK} JWKPublicKey -
	 * @param {String} algoName - example RSA256 | AES128
	 * @returns {Promise} that in success case returns {boolean}
	 */
	Krypter.prototype.verify = function (text, signature, JWKPublicKey, algoName) {

		if (typeof text == "object") {
			text = JSON.stringify(text);
		}
		var self = this;
		return loadKey(JWKPublicKey, "public", algoName).then(function (cryptoKey) {
			if (algorithms.hasOwnProperty(algoName)) {
				return crypto.subtle.verify(algorithms[algoName], cryptoKey, _b64toab(signature), self.str2ab(text));
			}
		});
	};

	/**
	 * Load key function
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

		return crypto.subtle.importKey("jwk", key, algorithms[algoName], true, usages);
	}

	/**
	 * Generate the KeyPair for asymmetric encryption
	 * @memberOf Krypter
	 * @param {Function} savePublicKeyFunction -
	 * @param {Function} savePrivateKeyFunction -
	 * @param {Function} [onFailFunction] -
	 */
	Krypter.prototype.generateKeyPairs = function (savePublicKeyFunction, savePrivateKeyFunction, onFailFunction) {
		arguments[2] == undefined ? arguments[2] = function (e) {
			throw new Error("Fail to generate keypairs", e.toString());
		} : arguments[2];

		crypto.subtle.generateKey({
			name: "RSASSA-PKCS1-v1_5",
			modulusLength: 2048,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: {name: "SHA-256"}
		},
		true,
		["sign", "verify"])
		.then(function (keys) {
			// Object with exported promises
			return {
				private: crypto.subtle.exportKey("jwk", keys.privateKey),
				public: crypto.subtle.exportKey("jwk", keys.publicKey)
			};
		}).then(function (exported) {
			//Save the key in the  JWK format
			exported.public.then(savePublicKeyFunction, onFailFunction);
			exported.private.then(savePrivateKeyFunction, onFailFunction);
		}, onFailFunction);
	};

	/**
	 * Convert ArrayBuffer to String
	 * @memberOf Krypter
	 * @param buf {ArrayBuffer}
	 * @returns {String}
	 */
	Krypter.prototype.ab2str = function (buf) {
		return String.fromCharCode.apply(null, new Uint16Array(buf));
	};

	/**
	 * Convert String to ArrayBuffer
	 * @memberOf Krypter
	 * @param str {String}
	 * @returns {ArrayBuffer}
	 */
	Krypter.prototype.str2ab = function (str) {

		var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
		var bufView = new Uint16Array(buf);
		for (var i = 0; i < str.length; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	};

	/**
	 * Convert a base64 string to ArrayBuffer
	 * @param {String} base64 - the string to convert
	 * @returns {ArrayBuffer}
	 */
	function _b64toab(base64) {
		var binary_string = root.atob(base64);
		var len = binary_string.length;
		var bytes = new Uint8Array(len);
		for (var i = 0; i < len; i++) {
			bytes[i] = binary_string.charCodeAt(i);
		}
		return bytes.buffer;
	}

	/**
	 * Convert an ArrayBuffer to a base64 String
	 * @param {ArrayBuffer} ab - the string to convert
	 * @returns {String}
	 */
	function _abtob64(ab) {
		return root.btoa(String.fromCharCode.apply(null, new Uint8Array(ab)));
	}

	root.Krypter = Krypter;
})(window);