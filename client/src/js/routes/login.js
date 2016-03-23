var loginFormValidation = require('../validation/login-form');
var login = Class({
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
				.done((data) =>
				{this.trigger('loginEvent', data);
				})
		/*.fail(function (answer) {
				console.log('login fail', answer);
				//if (answer.status==401) me.trigger('logoutEvent','expired')
			})*/;
		}
		return this;
	}
});

module.exports = login;
