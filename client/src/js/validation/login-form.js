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
			}
		}
	})/*.formValidation('validate')*/;
}

module.exports = loginFormValidation;
