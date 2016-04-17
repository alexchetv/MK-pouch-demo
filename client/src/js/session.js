"use strict";
//Содержит данные о текущей сессии и юзере
var Session = Class({
	'extends': MK.Object,
	constructor: function (data) {
		console.log('session creating', data);
		this
			.jset('user_id', null)
			.jset(data)
			.onDebounce('change', ()=> {
				console.log('session change', this);
				localStorage.setItem('session', JSON.stringify(this));
			}, 100)
			.bindNode('btnLogout', '#logout')
			.on('click::btnLogout', (evt)=> {
				evt.preventDefault();
				this.logout();
			})
			.bindNode('btnDestroy', '#destroy')
			.on('click::btnDestroy', (evt)=> {
				evt.preventDefault();
				this.logout(null, true);
			});
		this.parseBindings($('#session'));
	},
	//запрос на сервер с авторизацией
	authAjax: function (type, url,data) {
		console.log ('authAjax',type, url);
		if (this.token && this.password) {
			var me = this;
			return $.ajax({
				type: type,
				contentType: "application/json",
				data:data,
				url: url,
				headers: {'Authorization': 'Bearer ' + me.token + ':' + me.password},
				dataType: "json"
			})
				.fail((answer) => {
					if (answer.status == 401) {
						//нас успели выкинуть
						this.trigger('kickedEvent', 'Sorry! Your Session closed!');
					} else {
						let message = "Error something is wrong";
						if (answer.responseJSON && answer.responseJSON.message) {
							message = answer.responseJSON.message;
						}
						noti.createNoti({
							message: message,
							type: "error",
							showDuration: 2
						})
					}
					return answer;
				});
		} else {
			return $.Deferred().reject({responseJSON: {message: 'Token and password required'}});
		}
	},
	login: function(message = null,destroy = false) {
		//выходим на сервере
		this.authAjax('POST','/auth/logout');
		//и независимо от этого локально
		this.trigger('kickedEvent', message, destroy);
	},
	logout: function(message = null,destroy = false) {
		//выходим на сервере
		this.authAjax('POST','/auth/logout');
		//и независимо от этого локально
		this.trigger('kickedEvent', message, destroy);
	},

	//запрос на обновление сессии
	refresh: function () {
		return this.authAjax('POST', '/auth/refresh')
			.done((data) => {
				console.log('REFRESH', data);
				this.jset(data);
			})
			.fail((answer) => {
				console.log('fail', answer);
			});
	},
});

module.exports = Session;