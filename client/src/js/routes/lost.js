var Page = require('./page');

var lost = Class({
	'extends': Page,
	title:'Page Not Found',
	renderer:
		`<h4>404</h4>
	<div>Page Not Found</div>
	<div><a class="page-link" href="/">Go Home</a></div>`,

	constructor: function () {
		this.setTitle();
		this.on('afterrender', () => {
			this.bindNode('pageLink', ':sandbox .page-link')
				.on('click::pageLink', (evt)=> {
					evt.preventDefault();
					this.trigger('wantPage', evt.target.pathname)
				});
		});
	}
});

module.exports = lost;