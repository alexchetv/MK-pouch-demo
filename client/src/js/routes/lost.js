var lost = Class({
	'extends': MK.Object,
	constructor: function () {
		this.on('afterrender', () => {
			this.bindNode('pageLink', ':sandbox .page-link')
				.on('click::pageLink', (evt)=> {
					this.trigger('wantPage', evt.target.pathname)
				});
		});
	}
});

module.exports = lost;