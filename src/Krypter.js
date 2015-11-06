var Krypter = (function(root){

	/*
	 A class for sign and verify plaintext with Web Cryptographic API
	 */
	var RSA256 = {name:"RSASSA-PKCS1-v1_5", hash:{name:"SHA-256"}}; // must be the same
	var AESalgo = {name: "AES-CBC", length: 128, iv: initialVector};

	var privateKey; /* privateKey {JSON Web Key} */
	var publicKey; /* publicKey {JSON Web Key} */
	var cryptoPrivateKey;
	var cryptoPublicKey;
	var crypto = root.crypto || root.msCrypto || root.crypto.webkitSubtle;

	if(crypto === undefined){
		throw new Error("HTML5 WebCrypto not supported yet");
	}
	/**
	 *   TODO:Implement encrypt and decrypt function
	 */
	/**
	 *   TODO:Improve documentation
	 */
	var initialVector = crypto.getRandomValues(new Uint8Array(16));

	var RSAalgo = {
		name:"RSA-OAEP",
		hash: {name: "SHA-256"},
		modulusLength:2048,
		publicExponent:new Uint8Array([1, 0, 1])
	};

	function decorate(fn, fn2){
		return function(){
			return fn(fn2.apply(null, arguments));
		}
	}

	var algorithms = {RSA256:RSA256, AES128:AESalgo};

	function Krypter(){}

	Krypter.prototype.sign = function(text, JWKPrivateKey, algoName, saveSignature){
		/**
		 * The function to sign a textplain or an object
		 * @param {String|Object} text - An object or a string to sign
		 * @param {JWK} JWKPrivateKey - the jwk private key to load as CryptoKey object
		 * @param {String} algoName - RSA256 for example or AES128
		 * @param {Function} saveSignature - the callback to call with the digital base64 signature
		 */

		var saveSignatureDecoratedFn = decorate(saveSignature, _abtob64);

		if(typeof text == "object"){text = JSON.stringify(text)}

		var self = this;
		loadKey(JWKPrivateKey, "private", algoName).then(function(cryptoKey){
			if(algorithms.hasOwnProperty(algoName)){
				crypto.subtle.sign(algorithms[algoName], cryptoKey, self.str2ab(text))
					.then(saveSignatureDecoratedFn);
			}
		});
	};

	Krypter.prototype.verify = function(text, signature, JWKPublicKey, algoName){
		/**
		 * The function to verify a signature
		 * @param {String|Object} text
		 * @param signature {ArrayBuffer} the signature to verify
		 * @param {JWK} JWKPublicKey -
		 * @param {String} algoName - example RSA256 | AES128
		 * @returns {Promise} that in success case returns {boolean}
		 */
		if(typeof text == "object"){text = JSON.stringify(text)}
		var self = this;
		loadKey(JWKPublicKey, "public", algoName).then(function(cryptoKey){
			if(algorithms.hasOwnProperty(algoName)){
				return crypto.subtle.verify(algorithms[algoName], cryptoKey, _b64toab(signature), self.str2ab(text));
			}
		});
	};

	function loadKey(key, privateOrPublic, algoName){
		/**
		 * Load key function
		 * @param key {JWK} key in Javascript Web Key format
		 * @param {String} privateOrPublic - 'private' and 'public' are the possible values
		 * @param {String} algoName - the algo label name for example 'RSA256'
		 * @returns {Promise}
		 * */
		var usages;
		if(privateOrPublic == "private"){
			usages = ["sign"];
		}else{
			usages = ["verify"];
		}

		return crypto.subtle.importKey("jwk", key, algorithms[algoName], true, usages);
	}

	Krypter.prototype.generateKeyPairs = function(savePublicKeyFunction, savePrivateKeyFunction, onFailFunction){
		/**
		 * Generate the KeyPair for asymmetric encyption
		 * @param {Function} savePublicKeyFunction -
		 * @param {Function} savePrivateKeyFunction -
		 * @param {Function} [onFailFunction] -
		 */

		arguments[2] == undefined ? arguments[2] = function(){console.error(arguments);} : arguments[2];

		crypto.subtle.generateKey({name: "RSASSA-PKCS1-v1_5",
			modulusLength: 2048,
			publicExponent: new Uint8Array([1,0,1]),
			hash:{name:"SHA-256"}},
		true,
		["sign","verify"])
			.then(function(keys){
				// Object with exported promises
				return {
					private:crypto.subtle.exportKey("jwk", keys.privateKey),
					public:crypto.subtle.exportKey("jwk", keys.publicKey)
				};
			}).then(function(exported){
				//Save the key in the  JWK format
				exported.public.then(savePublicKeyFunction, onFailFunction);
				exported.private.then(savePrivateKeyFunction, onFailFunction);
			}, onFailFunction);
	};

	//utils functions
	Krypter.prototype.ab2str = function(buf) {

		/**
		 * Convert ArrayBuffer to String
		 * @param buf {ArrayBuffer}
		 * @returns {String}
		 */

		return String.fromCharCode.apply(null, new Uint16Array(buf));
	};

	Krypter.prototype.str2ab = function(str) {

		/**
		 * Convert String to ArrayBuffer
		 * @param str {String}
		 * @returns {ArrayBuffer}
		 */

		var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
		var bufView = new Uint16Array(buf);
		for (var i=0; i < str.length; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	};

	//Utils
	// TODO: create a different  module?
	function _b64toab(base64) {
		var binary_string =  root.atob(base64);
		var len = binary_string.length;
		var bytes = new Uint8Array( len );
		for (var i = 0; i < len; i++)        {
			bytes[i] = binary_string.charCodeAt(i);
		}
		return bytes.buffer;
	}

	function _abtob64(ab){
		return root.btoa(String.fromCharCode.apply(null, new Uint8Array(ab)));
	}

	return Krypter;
})(window);