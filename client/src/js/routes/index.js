var start = require('./start');
var profile = require('./profile');
var login = require('./login');
var register = require('./register');

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