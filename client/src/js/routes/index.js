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
/**
 Содержит массив страниц приложения

 @class Routes
 @constructor
 */

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
			.linkProps('loggedIn', [
				session, 'user_id'
			], function (a) {
				return !!a;
			})
			.on('change:current', (evt) => {
				console.log('change:routes.current', this.loggedIn, this.current,evt.attach,session);
				this.recreate();
				if (this.current) {
					if (routesList.hasOwnProperty(this.current)) {
						if (!this.loggedIn && routesList[this.current].restricted) {
							this.current = 'login';
						} else {
							this.push(new routesList[this.current].creator(session,evt.attach));//передаем сессию и аттачмент
						}
					} else {
						this.current = 'lost';
					}
				} else {
					this.current = 'todos';
				}
			})
			.on('removeone', function(evt) {
				let r = evt.removed;
				if (r.wipeOut) r.wipeOut();
				r = null;
			});
		this.initRouter('current', 'history');
	}
});

module.exports = Routes;