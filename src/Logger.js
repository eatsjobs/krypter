/**
 * Created by pasquale on 29/10/15.
 */

var Logger;
Logger = (function (global) {

	function Logger(initialLevel) {
		this.level = initialLevel;
	}

	Logger.prototype.d = function () {
		if (this.level != 0 && this.level >= 1) {
			global.console.log.apply(console, arguments);
		}
	};

	Logger.prototype.e = function () {
		if (this.level != 0 && this.level >= 4) {
			global.console.error.apply(console, arguments);
		}
	};

	Logger.prototype.i = function () {
		if (this.level != 0 && this.level >= 3) {
			global.console.info.apply(console, arguments);
		}
	};

	Logger.prototype.w = function () {
		if (this.level != 0 && this.level >= 2) {
			global.console.warn.apply(console, arguments);
		}
	};

	Logger.prototype.setLevel = function (level) {
		this.level = level;
	};

	return Logger;
})(window);
