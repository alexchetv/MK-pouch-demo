var registerFormValidation = require('../validation/register-form');
var register = Class({
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
				.done((data) =>
				{this.trigger('registerEvent', {name:this.username,pass:this.password});
					console.log('trigger registerEvent',data);
				})
		}
		return this;
	}
});

module.exports = register;