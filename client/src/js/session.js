var Session = Class({
	'extends': MK.Object,
	constructor: function (data) {
		this
			.onDebounce('change', ()=> {
				console.log('session change',this);
				localStorage.setItem('session', JSON.stringify(this));
			},100)
			.bindNode('btnLogout', '#logout')
			.on('click::btnLogout',()=>{this.trigger('logoutEvent')});
		this.parseBindings($('#session'));
	},
	refresh: function() {
		console.log('this.token', this.token);
		if (this.token && this.password) {
			var me = this;
			$.ajax({
				type: "POST",
				contentType: "application/json",
				url: '/auth/refresh',
				headers: {'Authorization': 'Bearer ' + me.token + ':' + me.password},
				dataType: "json"
			})
				.done(function (data) {
					console.log(me, data);
					me.expires = data.expires;
					//TODO check others returned user data and logout if they change
				})
				.fail(function (answer) {
					console.log('fail', answer);
					if (answer.status==401) me.trigger('logoutEvent')
				})
				/*.always(function() {
				 alert( "complete" );
				 })*/;
		}
	},
});

module.exports = Session;