var loginFormValidation = function() {
	$('#login-form').formValidation({
		framework: 'skeleton',
		autoFocus: false,
		icon: {
			valid: 'fa fa-check',
			invalid: 'fa fa-exclamation my-wave',
			validating: 'fa fa-refresh',
			feedback: 'fv-control-feedback'
		},
		fields: {
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
			}
		}
	})/*.formValidation('validate')*/;
}

module.exports = loginFormValidation;
