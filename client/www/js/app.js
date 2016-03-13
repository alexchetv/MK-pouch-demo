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
				rememberMe: true
			})
			.on('afterrender', function (evt) {
				console.log('login render', evt);
				this
					.bindNode({
						sandbox: '#login-form',
						userName: ":sandbox input[name='username']",
						password: ":sandbox input[name='password']",
						showPassword: ':sandbox .show-password',
						rememberMe: ':sandbox .remember-me',
						btnLogin: ':sandbox #btn-login'
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
					});
			});
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
			})
			.on('afterrender', function (evt) {
				console.log('register render', evt);
				this
					.bindNode({
						sandbox: '#register-form',
						userName: ":sandbox input[name='username']",
						email: ":sandbox input[name='email']",
						password: ":sandbox input[name='password']",
						showPassword: ':sandbox .show-password',
						btnRegister: ':sandbox #btn-register'
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
					});
			});
	},
	register: function () {
		alert(JSON.stringify(this.toJSON()));
		return this;
	}
});

/*****************************************************************
 * Pages
 */

var Pages = Class({
	'extends': MK.Array,
	constructor: function (data) {
		this
			.bindNode('sandbox', '#page-content')
			.on('pageChange', function (evt) {
				this.recreate();
				if (evt.value == 'login') {
					this.set('itemRenderer', '#login-form-template');
					this.Model = LoginForm;
				}
				else if (evt.value == 'register') {
					this.set('itemRenderer', '#register-form-template');
					this.Model = RegisterForm;
				}
				this.renderIfPossible = false;
				this.recreate([{}]);
				this.renderIfPossible = true;
				this.rerender({
					forceRerender: true
				});
			})
		;
	},
	onItemRender: function (item, evt) {
		console.log('item render', item, evt)
	}
});

/*****************************************************************
 * Application
 */

var Application = Class({
	'extends': MK.Object,
	constructor: function () {
		this
			.bindNode('sandbox', '#app')
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

			.setClassFor('pages', Pages)
			.on('change:pageLink', function (evt) {
				this.pages.trigger('pageChange', evt);
			})
			.initRouter('pageLink', 'history');
	}
});
var app = new Application();