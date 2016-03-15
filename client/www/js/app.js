/*****************************************************************
 * pagesClasses
 */
var pagesClasses = {

	/* Start*/


	start : Class({
		'extends': MK.Object,
		constructor: function () {
		}
	}),

	 /* LoginForm*/


	login : Class({
		'extends': MK.Object,
		constructor: function () {
			this
				.jset({
					username: '',
					password: ''
				})
				.on('afterrender', function (evt) {
					console.log('login render', evt);
					this
						.bindNode({
							username: ":sandbox input[name='username']",
							password: ":sandbox input[name='password']",
							showPassword: ':sandbox .show-password',
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
							this.send();
						});
					loginFormValidation();
				});
		},
		send: function () {
			$('#login-form').data('formValidation').validate();
			if ($('#login-form').data('formValidation').isValid()) {
				console.log(JSON.stringify(this.toJSON()));
				$.ajax({
					type: "POST",
					contentType: "application/json",
					url: '/auth/login',
					data: JSON.stringify(this.toJSON()),
					dataType: "json"
				})
					.done(function (data) {
						app.session = data;
						app.pageLink='start';
						console.log(app.session);
					});
			}
			return this;
		}
	}),


 /* RegisterForm */

register : Class({
	'extends': MK.Object,
	constructor: function () {
		this
			.jset({
				username: '',
				password: '',
				confirmPassword: '',
				email: ''
			})
			.on('afterrender', function (evt) {
				console.log('register render', evt);
				this
					.bindNode({
						username: ":sandbox input[name='username']",
						email: ":sandbox input[name='email']",
						password: ":sandbox input[name='password']",
						confirmPassword: ":sandbox input[name='confirm']",
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
						this.send();
					});
				registerFormValidation();
			});
	},
	send: function () {
		$('#register-form').data('formValidation').validate();
		if ($('#register-form').data('formValidation').isValid()) {
			console.log(JSON.stringify(this.toJSON()));
			$.ajax({
				type: "POST",
				contentType: "application/json",
				url: '/auth/register',
				data: JSON.stringify(this.toJSON()),
				dataType: "json"
			})
				.done(function (data) {
					app.pageLink='start';
				});
		}
		return this;
	}
})

}
/*****************************************************************
 * Page
 */

var Page = Class({
	'extends': MK.Array,
	itemRenderer: function () {
		return '#' + app.pageLink + '-template';
	},
	constructor: function (data) {
		this
			.bindNode('sandbox', '#page-content')
			.onDebounce('pageChange', function (newPage) {
				this.recreate();
				if (pagesClasses.hasOwnProperty(newPage)) {
					this.push(new pagesClasses[newPage]);
				} else {
					app.pageLink = 'start';
				}
			},100)
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
			.set('page', new Page())
			.on('change:pageLink', function (evt) {
				console.log('change:pageLink', evt.value);
				this.page.trigger('pageChange', evt.value);
			})
	}
});
var app = new Application();
app.initRouter('pageLink', 'history');