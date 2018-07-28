const gulp = require("gulp");
const run = require("gulp-run");

gulp.task("server", () => run("npm run dev").exec());
