/**
 * Convert a base64 string to ArrayBuffer
 * @private
 * @param {String} base64 - the string to convert
 * @returns {ArrayBuffer}
 */
function _b64toab(base64) {
	var binary_string = window.atob(base64);
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
	return window.btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
}

/**
 * Convert ArrayBuffer to String
 * @param buf {ArrayBuffer}
 * @returns {String}
 */
function ab2str(buf) {
	return String.fromCharCode.apply(null, new Uint16Array(buf));
}

/**
 * Convert String to ArrayBuffer
 * @param {String} str
 * @returns {ArrayBuffer}
 */
function str2ab(text) {

	var buf = new ArrayBuffer(text.length * 2); // 2 bytes for each char
	var bufView = new Uint16Array(buf);
	for (var i = 0; i < text.length; i++) {
		bufView[i] = text.charCodeAt(i);
	}
	return buf;
}

module.exports = {
    b64toab:_b64toab,
    abtob64:_abtob64,
    str2ab:str2ab,
    ab2str:ab2str
};