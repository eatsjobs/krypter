/**
 * A module for sign and verify plaintext and javascript object with Web Cryptographic API
 * At the moment only sign and verify is provided. But it will be possible to encrypt and decrypt
 * and wrap symmetric key with asymmetric ones.
 * @class Krypter
 * @version 1.0.0
 */
(function (root) {

	var RSA256 = {name: "RSASSA-PKCS1-v1_5", hash: {name: "SHA-256"}};
	var AESalgo = {name: "AES-CBC", length: 128, iv: initialVector};

    var crypto;
        crypto = root.crypto || root.msCrypto || (root.crypto.webkitSubtle ? crypto.subtle = root.crypto.webkitSublte : null);

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
	 * @param {String|Object} text - An object or a string to sign
	 * @param {JWK} JWKPrivateKey - the jwk private key to load as CryptoKey object
	 * @param {String} algoName - RSA256 for example or AES128
	 * @param {Function} saveSignature - the callback to call with the digital base64 signature
	 */
	Krypter.prototype.sign = function (text, JWKPrivateKey, algoName) {
		//var saveSignatureDecoratedFn = decorate(saveSignature, _abtob64);

		if (typeof text == "object") {
			text = JSON.stringify(text);
		}

		var self = this;

        function s(cryptoKey){
            if (algorithms.hasOwnProperty(algoName)) {
                return crypto.subtle.sign(algorithms[algoName], cryptoKey, self.str2ab(text))
                    .then(_abtob64);
            }
        }

		return loadKey(JWKPrivateKey, "private", algoName).then(s);
	};

	/**
	 * The function to verify a signature
	 * @memberOf Krypter
	 * @param {String|Object} text
	 * @param {ArrayBuffer} signature - the signature to verify
	 * @param {JWK} JWKPublicKey -
	 * @param {String} algoName - example RSA256 | AES128
	 * @returns {Promise} that in success case returns {boolean} the result of verification
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

		return crypto.subtle.importKey("jwk", key, algorithms[algoName], true, usages);
	}

	/**
	 * Generate the KeyPairs for asymmetric encryption
     * @returns {Promise} fullfilled with keys.privateJWK, keys.publicJWK
	 */
	Krypter.prototype.generateKeyPairs = function () {

        var generator = crypto.subtle.generateKey({
                name: "RSASSA-PKCS1-v1_5",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: {name: "SHA-256"}
            },
            true,
            ["sign", "verify"]);

		return generator.then(function (keys) {
			// Object with exported promises
			return [
				crypto.subtle.exportKey("jwk", keys.privateKey),
				crypto.subtle.exportKey("jwk", keys.publicKey)
			];
		}).then(function (exported) {
            //exported[0] private
            //exported[1] public
			return Promise.all(exported);
		});
	};

	/**
	 * Convert ArrayBuffer to String
	 * @param buf {ArrayBuffer}
	 * @returns {String}
	 */
	Krypter.prototype.ab2str = function (buf) {
		return String.fromCharCode.apply(null, new Uint16Array(buf));
	};

	/**
	 * Convert String to ArrayBuffer
	 * @param {String} str
	 * @returns {ArrayBuffer}
	 */
	Krypter.prototype.str2ab = function (text) {

		var buf = new ArrayBuffer(text.length * 2); // 2 bytes for each char
		var bufView = new Uint16Array(buf);
		for (var i = 0; i < text.length; i++) {
			bufView[i] = text.charCodeAt(i);
		}
		return buf;
	};

	/**
	 * Convert a base64 string to ArrayBuffer
     * @private
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
     * @private
	 * @param {ArrayBuffer} ab - the string to convert
	 * @returns {String}
	 */
	function _abtob64(arrayBuffer) {
		return root.btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
	}

	root.Krypter = new Krypter;
})(window);