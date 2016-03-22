'use strict';

module.exports = {
	entry: "./client/src/js/app.js",
	output: {
		//path: __dirname + "/dist",
		filename: "./client/www/js/bundle.js"
	},
	watch: true,
	watchOption: {
		aggregateTimeout: 500
	}
}