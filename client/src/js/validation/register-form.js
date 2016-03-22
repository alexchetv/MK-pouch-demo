var registerFormValidation = function() {
	$('#register-form').formValidation({
		framework: 'skeleton',
		autoFocus: false,
		icon: {
			valid: 'fa fa-check',
			invalid: 'fa fa-times',
			validating: 'fa fa-refresh',
			feedback: 'fv-control-feedback'
		},
		fields: {
			username: {
				verbose: false,
				validators: {
					notEmpty: {
						message: 'The username is required'
					},
					stringLength: {
						min: 3,
						max: 16,
						message: 'The username must be more than 3 and less than 16 characters long'
					},
					regexp: {
						regexp: /^[a-zA-Z0-9_-]+$/,
						message: 'The username can only consist of alphabetical, number, underscore and hyphen'
					},
					remote: {
						validKey: 'ok',
						message: 'The username is not available',
						url: function (validator) {
							return '/auth/validate-username/' + validator.getFieldElements('username').val();
						},
						type: 'GET'
					}
				}
			},
			email: {
				verbose: false,
				validators: {
					notEmpty: {
						message: 'The email is required'
					},
					regexp: {
						regexp: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/,
						message: 'The email address is not valid'
					},
					remote: {
						validKey: 'ok',
						message: 'The email is not available',
						url: function (validator) {
							return '/auth/validate-email/' + validator.getFieldElements('email').val();
						},
						type: 'GET'
					}
				}
			},
			password: {
				validators: {
					notEmpty: {
						message: 'The password is required'
					},
					stringLength: {
						min: 6,
						max: 20,
						message: 'The password must be more than 6 and less than 20 characters long'
					}
				}
			},
			confirm: {
				validators: {
					notEmpty: {
						message: 'Please retype the password'
					},
					identical: {
						field: 'password',
						message: 'The password and its confirm are not the same'
					}
				}
			}
		}
	});
}

module.exports = registerFormValidation;

