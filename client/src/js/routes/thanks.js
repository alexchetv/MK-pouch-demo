var Page = require('./page');

var Thanks = Class({
	'extends': Page,
	title:'Thanks for signing up!',
	renderer:
		`<h4>Thanks for signing up!</h4>
	<div>Please check your inbox for confirmation letter and click link on it. After that you can log in.</div>`,
});

module.exports = Thanks;