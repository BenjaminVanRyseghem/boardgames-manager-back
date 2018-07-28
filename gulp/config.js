const dest = "./dist";
const src = "./client";
const babelify = require("babelify");
const scssify = require("scssify");
const inlineImage = require("gulp-base64-image");

module.exports = {
	linting: {
		source: ["client/**/*.js", "gulp/tasks/**/*.js", "example/**/*.js", "lib/**/*.js", "tests/**/*.js"]
	},
	browserify: {
		settings: {
			transform: [
				[
					scssify,
					{
						sass: {
							functions: inlineImage({ url: "styles/images/" })
						}
					}
				],
				babelify
			],
			standalone: "BoardGamesManager",
			entries: `${src}/index.js`,
			debug: true
		},
		dest,
		outputName: "boardgames-manager.js",
		outputMinName: "boardgames-manager.min.js"
	},
	sass: {
		src: "./styles/main.scss",
		dest,
		settings: {
			indentedSyntax: false,
			functions: inlineImage({ url: "styles/images/" })
		}
	},
	html: {
		src: "example/**/*",
		html: "example/**/*.html",
		dest
	},
	watch: {
		src: ["./client/**/*.*", "./styles/**/*.*", "./example/**/*.*"],
		tasks: ["build"]
	}
};
