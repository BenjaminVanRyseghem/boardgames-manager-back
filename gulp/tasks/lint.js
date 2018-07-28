const gulp = require("gulp");
const eslint = require("gulp-eslint");
const config = require("../config.js").linting;

gulp.task("lint", () => gulp.src(config.source)
	.pipe(eslint())
	.pipe(eslint.format("unix"))
	.pipe(eslint.failAfterError()));
