var Server = require('karma').Server;
var gulp = require('gulp');
var gutil = require('gulp-util');
var sh = require('shelljs');

/**
 * Test task, run test once and exit
 */
gulp.task('test', function(done) {

	var server;
	server = new Server({configFile: __dirname + '/karma.conf.js', singleRun: false, autoWatch:false}, done);
	return server.start();
});

gulp.task('default', ['test']);