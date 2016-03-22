var routes = require('./routes');
var Session = require('./session');
var init = require('./init');

/*****************************************************************
 * Page
 */

var Page = Class({
	'extends': MK.Array,
	itemRenderer: function () {
		return '#' + this.current + '-template';
	},
	constructor: function (data) {
		this
			.bindNode('sandbox', '#page-content')
			.onDebounce('change:current', function (evt) {
				console.log('change:page.current', evt.value);
				this.recreate();
				if (routes.hasOwnProperty(evt.value)) {
					this.push(new routes[evt.value]);
				} else {
					this.current = 'start';
				}
			}, 100);
		this.initRouter('current', 'history');
	}
});

/*****************************************************************
 * Application
 */

var Application = Class({
	'extends': MK.Object,

	constructor: function () {
		this
			.setClassFor('session', Session)
			.set('page', new Page())
			.bindNode('sandbox', '#app')
			.bindNode('page.current', ':sandbox .page-link', {
				on: 'click',
				getValue: function () {
					return $(this).attr('href').substr(1);
				}
			}, {assignDefaultValue: false})
			.bindNode('page.current', ':sandbox .page-wrap', {
				getValue: null,
				setValue: function (v) {
					$(this).toggleClass('active', $(this).children().attr('href').substr(1) == v);
				}
			})
			.bindNode('session.user_id', ':sandbox .not-logged-in', {
				getValue: null,
				setValue: function (v) {
					$(this).toggleClass('hidden', !!v);
				}
			})
			.bindNode('session.user_id', ':sandbox .logged-in', {
				getValue: null,
				setValue: function (v) {
					$(this).toggleClass('hidden', !v);
				}
			})
			.on('page.*@loginEvent', (data)=> {
				console.log('loginEvent', data);
				//set session properties
				this.session = data;
				this.page.current = 'start';
			})
			.on('session@logoutEvent',
			(reason)=> {//explain why the user was logged out (e.g. 'manual', 'expired')
				console.log('session@logoutEvent', this.session);
				this.session.each((value, key) => {
					this.session[key] = '';
				})
				this.page.current = 'login';
			});
		//recreate session from the one previously saved in localStorage
		this.session = JSON.parse(localStorage.getItem('session'));
		//then refresh it
		this.session.refresh();
	}
});
var app = new Application();
init();