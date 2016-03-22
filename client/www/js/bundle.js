/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var routes = __webpack_require__(1);
	var Session = __webpack_require__(8);
	var init = __webpack_require__(9);

	/*****************************************************************
	 * Page
	 */

	var Page = Class({
		'extends': MK.Array,
		itemRenderer: function () {
			return '#' + this.current + '-template';
		},
		constructor: function (data) {
			this
				.bindNode('sandbox', '#page-content')
				.onDebounce('change:current', function (evt) {
					console.log('change:page.current', evt.value);
					this.recreate();
					if (routes.hasOwnProperty(evt.value)) {
						this.push(new routes[evt.value]);
					} else {
						this.current = 'start';
					}
				}, 100);
			this.initRouter('current', 'history');
		}
	});

	/*****************************************************************
	 * Application
	 */

	var Application = Class({
		'extends': MK.Object,

		constructor: function () {
			this
				.setClassFor('session', Session)
				.set('page', new Page())
				.bindNode('sandbox', '#app')
				.bindNode('page.current', ':sandbox .page-link', {
					on: 'click',
					getValue: function () {
						return $(this).attr('href').substr(1);
					}
				}, {assignDefaultValue: false})
				.bindNode('page.current', ':sandbox .page-wrap', {
					getValue: null,
					setValue: function (v) {
						$(this).toggleClass('active', $(this).children().attr('href').substr(1) == v);
					}
				})
				.bindNode('session.user_id', ':sandbox .not-logged-in', {
					getValue: null,
					setValue: function (v) {
						$(this).toggleClass('hidden', !!v);
					}
				})
				.bindNode('session.user_id', ':sandbox .logged-in', {
					getValue: null,
					setValue: function (v) {
						$(this).toggleClass('hidden', !v);
					}
				})
				.on('page.*@loginEvent', (data)=> {
					console.log('loginEvent', data);
					//set session properties
					this.session = data;
					this.page.current = 'start';
				})
				.on('session@logoutEvent',
				()=> {
					console.log('session@logoutEvent', this.session);
					this.session.each((value, key) => {
						this.session[key] = '';
					})
					this.page.current = 'login';
				});
			//recreate session from the one previously saved in localStorage
			this.session = JSON.parse(localStorage.getItem('session'));
			//then refresh it
			this.session.refresh();
		}
	});
	var app = new Application();
	init();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var start = __webpack_require__(2);
	var profile = __webpack_require__(3);
	var login = __webpack_require__(4);
	var register = __webpack_require__(6);

	var routes = {

		/* Start*/

		start : start,

		/* Profile*/

		profile : profile,

		/* LoginForm*/

		login : login,

		/* RegisterForm */

		register : register
	}

	module.exports = routes;

/***/ },
/* 2 */
/***/ function(module, exports) {

	var start = Class({
		'extends': MK.Object,
		constructor: function () {
		}
	});

	module.exports = start;

/***/ },
/* 3 */
/***/ function(module, exports) {

	var profile = Class({
		'extends': MK.Object,
		constructor: function () {
		}
	});

	module.exports = profile;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var loginFormValidation = __webpack_require__(5);
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
					});
			}
			return this;
		}
	});

	module.exports = login;


/***/ },
/* 5 */
/***/ function(module, exports) {

	var loginFormValidation = function() {
		$('#login-form').formValidation({
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
		});
	}

	module.exports = loginFormValidation;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var registerFormValidation = __webpack_require__(7);
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
					.done(function (data) {

					});
			}
			return this;
		}
	});

	module.exports = register;

/***/ },
/* 7 */
/***/ function(module, exports) {

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



/***/ },
/* 8 */
/***/ function(module, exports) {

	var Session = Class({
		'extends': MK.Object,
		constructor: function (data) {
			this
				.onDebounce('change', ()=> {
					console.log('session change',this);
					localStorage.setItem('session', JSON.stringify(this));
				},100)
				.bindNode('btnLogout', '#logout')
				.on('click::btnLogout',()=>{this.trigger('logoutEvent')});
			this.parseBindings($('#session'));
		},
		refresh: function() {
			console.log('this.token', this.token);
			if (this.token && this.password) {
				var me = this;
				$.ajax({
					type: "POST",
					contentType: "application/json",
					url: '/auth/refresh',
					headers: {'Authorization': 'Bearer ' + me.token + ':' + me.password},
					dataType: "json"
				})
					.done(function (data) {
						console.log(me, data);
						me.expires = data.expires;
						//TODO check others returned user data and logout if they change
					})
					.fail(function (answer) {
						console.log('fail', answer);
						if (answer.status==401) me.trigger('logoutEvent')
					})
					/*.always(function() {
					 alert( "complete" );
					 })*/;
			}
		},
	});

	module.exports = Session;

/***/ },
/* 9 */
/***/ function(module, exports) {

	var
		$popoverLink = $('[data-popover]'),
		$document = $(document);

	function init() {
		$popoverLink.on('click', openPopover);
		$document.on('click', closePopover);
	}

	function openPopover(e) {
		e.preventDefault();
		closePopover();
		$(e.currentTarget).addClass('active');
		var popover = $($(this).data('popover'));
		popover.addClass('open');
		e.stopImmediatePropagation();
	}

	function closePopover(e) {
		if($('.popover.open').length > 0) {
			$('.popover').removeClass('open');
			$popoverLink.removeClass('active');
		}
	}

	module.exports = init;

/***/ }
/******/ ]);