var Todos = require('./todos');
var profile = require('./profile');
var login = require('./login');
var register = require('./register');
var lost = require('./lost');

var routesList = {
	/* Todos*/
	todos : {
		creator: Todos,
		restricted: true
	},
	/* Profile*/
	profile : {
		creator: profile,
		restricted: true
	},
	/* LoginForm*/
	login : {
		creator: login,
		restricted: false
	},
	/* RegisterForm */
	register : {
		creator: register,
		restricted: false
	},
	/* Page Not Found*/
	lost : {
		creator: lost,
		restricted: false
	},
}

var Routes = Class({
	'extends': MK.Array,
	itemRenderer: function () {
		console.log('itemRenderer',this.current);
		return '#' + this.current + '-template';
	},
	constructor: function (session) {
		this
			.set('loggedIn',false)
			.bindNode('sandbox', '#page-content')
			.onDebounce('change:current', function (evt) {
				console.log('change:routes.current', this.loggedIn, evt.value,evt.attach);
				this.recreate();
				if (evt.value) {
					if (routesList.hasOwnProperty(evt.value)) {
						if (!this.loggedIn && routesList[evt.value].restricted) {
							this.current = 'login';
						} else {
							this.push(new routesList[evt.value].creator(session,evt.attach));//передаем сессию и аттачмент
						}
					} else {
						this.current = 'lost';
					}
				} else {
					this.current = 'todos';
				}
			}, 100);
		this.initRouter('current', 'history');
	}
});

module.exports = Routes;