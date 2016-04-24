var profileFormValidation = function() {
	$('#profile-form').formValidation({
		framework: 'skeleton',
		autoFocus: false,
		icon: {
			valid: 'fa fa-check',
			invalid: 'fa fa-exclamation my-wave',
			validating: 'fa fa-refresh',
			feedback: 'fv-control-feedback'
		},
		fields: {
			current: {
				validators: {
					notEmpty: {
						message: 'The current password is required'
					},
					stringLength: {
						min: 6,
						max: 20,
						message: 'The password must be more than 6 and less than 20 characters long'
					}
				}
			},
			name: {
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
			password: {
				validators: {
					notEmpty: {
						message: 'The new password is required'
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
	})
}

module.exports = profileFormValidation;
