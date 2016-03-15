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
						userName: ":sandbox input[name='username']",
						password: ":sandbox input[name='password']",
						showPassword: ':sandbox .show-password',
						rememberMe: ':sandbox .remember-me',
						btnLogin: ':sandbox #btn-login'
					})
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
				loginFormValidation();
			});
	},
	login: function () {
		$('#login-form').data('formValidation').validate();
		if ($('#login-form').data('formValidation').isValid()){
			alert(JSON.stringify(this.toJSON()));
		}
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
						userName: ":sandbox input[name='username']",
						email: ":sandbox input[name='email']",
						password: ":sandbox input[name='password']",
						showPassword: ':sandbox .show-password',
						btnRegister: ':sandbox #btn-register'
					})
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
				registerFormValidation();
			});
	},
	register: function () {
		$('#register-form').data('formValidation').validate();
		if ($('#register-form').data('formValidation').isValid()){
			alert(JSON.stringify(this.toJSON()));
		}
		return this;
	}
});

/*****************************************************************
 * Pages
 */

var Pages = Class({
	'extends': MK.Array,
	itemRenderer: function () {
		return '#' + app.pageLink + '-form-template';
	},
	constructor: function (data) {
		this
			.bindNode('sandbox', '#page-content')
			.on('pageChange', function (evt) {
				this.recreate();
				if (evt.value == 'login') {
					console.log('this.push(new LoginForm())');
					this.push(new LoginForm());
				}
				else if (evt.value == 'register') {
					console.log('this.push(new RegisterForm())');
					this.push(new RegisterForm());
				}
			})
		;
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
					$(this).toggleClass('active', $(this).children().attr('href').substr(1) == v);
				}
			}, {assignDefaultValue: false})
			.set('pages', new Pages())
			.on('change:pageLink', function (evt) {
				console.log('change:pageLink', evt.value);
				this.pages.trigger('pageChange', evt);
			})
	}
});
var app = new Application();
app.initRouter('pageLink', 'history');