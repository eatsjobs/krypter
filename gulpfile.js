var Server = require('karma').Server;
var gulp = require('gulp');
var gutil = require('gulp-util');
var sh = require('shelljs');
var eslint = require('gulp-eslint');

/**
 * Test task, run test once and exit
 */
gulp.task('test', function(done) {

	var server;
	server = new Server({configFile: __dirname + '/karma.conf.js', singleRun: false, autoWatch:false}, done);
	return server.start();
});

gulp.task('lint', function(){
	return gulp.src(['src/Krypter.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('default', ['lint']);
gulp.task('default', ['test']);