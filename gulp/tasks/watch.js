const gulp = require("gulp");
const config = require("../config").watch;

gulp.task("watch", ["build"], () => gulp.watch(config.src, config.tasks));

