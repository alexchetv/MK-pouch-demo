var registerFormValidation = function() {
	$('#register-form').formValidation({
		framework: 'skeleton',
		autoFocus: false,
		icon: {
			valid: 'fa fa-check',
			invalid: 'fa fa-exclamation my-wave',
			validating: 'fa fa-refresh',
			feedback: 'fv-control-feedback'
		},
		fields: {
			name: {
				verbose: false,
				validators: {
					notEmpty: {
						message: 'The name is required'
					},
					stringLength: {
						min: 3,
						max: 50,
						message: 'The name must be more than 3 and less than 50 characters long'
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
	})/*.formValidation('validate')*/;
}

module.exports = registerFormValidation;

