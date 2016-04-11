var Page = require('./page');

var registerFormValidation = require('../validation/register-form');
var register = Class({
	'extends': Page,
	title:'Register',
	renderer:`<form id="register-form">
		<h4>Register form</h4>

		<div class="row">
			<label>Username</label>
			<input class="u-full-width" name="username" type="text" placeholder="Username"/>
		</div>
		<div class="row">
			<label>Email</label>
			<input class="u-full-width" name="email" type="text" placeholder="Email"/>
		</div>
		<div class="row">
			<label>Password</label>
			<input class="u-full-width" name="password" type="password" placeholder="Password"/>
		</div>
		<div class="row">
			<label>Confirm Password</label>
			<input class="u-full-width" name="confirm" type="password" placeholder="Confirm Password"/>
		</div>
		<div class="row">
			<label>
				<input type="checkbox" class="show-password"/>
				<span class="label-body">Show Password</span>
			</label>
		</div>
		<div class="row">
			<div class="four columns">
				<input class="button-primary" id="btn-register" type="submit" value="Register"/>
			</div>
		</div>
	</form>`,
	constructor: function () {
		this.setTitle();
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
				.done((data) => {
					this.trigger('registerEvent', {name:this.username,pass:this.password});
					noti.createNoti({
						message: "You have successfully registered and can login now",
						type: "success",
						showDuration: 2
					})
				})
				.fail(function (answer) {
					let message = "Error something is wrong";
					if (answer.responseJSON && answer.responseJSON.message) {
						message =  answer.responseJSON.message;
					}
					noti.createNoti({
						message: message,
						type: "error",
						showDuration: 2,
						//это делает кнопку доступной (почему?)
						onHide: function() {
							$('#register-form').data('formValidation').revalidateField('username');
						}
					})
				});
		}
		return this;
	}
});

module.exports = register;