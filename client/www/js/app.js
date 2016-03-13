/*****************************************************************
 * LoginForm
 */

var LoginForm = Class({
	'extends': MK.Object,
	constructor: function () {
		this
			.jset({
				userName: '',
				password: '',
				rememberMe: true,
				//showPassword: false
			})
			.bindNode({
				sandbox: '#login-form',
				userName: ":sandbox input[name='username']",
				password: ":sandbox input[name='password']",
				showPassword: ':sandbox .show-password',
				rememberMe: ':sandbox .remember-me',
				btnLogin: '#btn-login'
			})
			/*.linkProps('isValid', 'userValid passValid', function (userValid, passValid) {
				return userValid && passValid;
			})*/
			.bindNode('showPassword', ':bound(password)', {
				getValue: null,
				setValue: function (v) {
					this.type = v ? 'text' : 'password';
				}
			})
			.on('click::btnLogin', function (evt) {
				evt.preventDefault();
				this.login();
			})
		;
	},
	login: function () {
		alert(JSON.stringify(this.toJSON()));
		return this;
	}
});


/*****************************************************************
 * RegisterForm
 */

var RegisterForm = Class({
	'extends': MK.Object,
	constructor: function () {
		this
			.jset({
				userName: '',
				password: '',
				email: ''
				//showPassword: false
			})
			.bindNode({
				sandbox: '#register-form',
				userName: ":sandbox input[name='username']",
				email: ":sandbox input[name='email']",
				password: ":sandbox input[name='password']",
				showPassword: ':sandbox .show-password',
				btnRegister: '#btn-register'
			})
			/*.linkProps('isValid', 'userValid passValid', function (userValid, passValid) {
			 return userValid && passValid;
			 })*/
			.bindNode('showPassword', ":sandbox [name='password'],[name='confirm']", {
				getValue: null,
				setValue: function (v) {
					this.type = v ? 'text' : 'password';
				}
			})
			.on('click::btnRegister', function (evt) {
				evt.preventDefault();
				this.register();
			})
		;
	},
	register: function () {
		alert(JSON.stringify(this.toJSON()));
		return this;
	}
});

/*****************************************************************
 * Application
 */

var Application = Class({
	'extends': MK.Object,
	constructor: function () {
		this
			.bindNode('sandbox','#app')
			.bindNode('pageLink', ':sandbox .page-link', {
				on: 'click',
				getValue: function (e) {
					e.preventDefault();
					return $(this).attr('href').substr(1);
				}
			}, {assignDefaultValue: false})
			.bindNode('pageLink', ':sandbox .page-span', {
				getValue: null,
				setValue: function (v) {
					//console.log($(this).attr('href').substr(1),v);
					$(this).toggleClass('active', $(this).children().attr('href').substr(1) == v);
				}

			}, {assignDefaultValue: false})
			.bindNode('pageLink', "[data-page]", {
				getValue: null,
				setValue: function (v) {
					//console.log($(this).attr('href').substr(1),v);
					$(this).toggleClass('hidden', $(this).attr('data-page') != v);
				}

			}, {assignDefaultValue: false})
			.on('beforechange:pageLink', function(evt) {
				console.log(evt,'pageLink will be changed in few microseconds');
			})
			.on('change:pageLink', function(evt) {
				if (evt.previousValue) {
					this.remove('page');
				}
				if (evt.value == 'login') {
					this.setClassFor('page', LoginForm);
				}
				else if (evt.value == 'register') {
					this.setClassFor('page', RegisterForm);
				}
				console.log(evt,'pageLink changed');
			})
			.initRouter('pageLink', 'history');
	}
});
var app = new Application();

