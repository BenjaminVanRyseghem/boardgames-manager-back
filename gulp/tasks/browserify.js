const browserify = require("browserify");
const buffer = require("vinyl-buffer");
const connect = require("gulp-connect");
const gulp = require("gulp");
const gutil = require("gulp-util");
const source = require("vinyl-source-stream");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const watchify = require("watchify");
const config = require("../config.js").browserify;

watchify.args.debug = config.settings.debug;
const bundler = watchify(browserify(config.settings, watchify.args));

gulp.task("browserify", ["browserify:regular", "browserify:min"], () => {});
gulp.task("browserify:regular", bundle);
gulp.task("browserify:min", bundleMin);
bundler.on("update", bundle);

/**
 * Bundle the app using browserify
 * @return {Stream|*|void} - gulp stream
 */
function bundle() {
	return bundler.bundle()
		.on("error", gutil.log.bind(gutil, "Browserify Error"))
		.pipe(source(config.outputName))
		.pipe(gulp.dest(config.dest))
		.pipe(connect.reload());
}

/**
 * Bundle and minify the app using browserify
 * @return {Stream|*|void} - gulp stream
 */
function bundleMin() {
	const browserifier = browserify({
		standalone: config.settings.standalone,
		entries: config.settings.entries,
		debug: false,
		transform: config.settings.transform
	});

	return browserifier.bundle()
		.pipe(source(config.outputMinName))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(uglify())
		.on("error", gutil.log.bind(gutil, "Browserify Error"))
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(config.dest));
}
