var Todos = require('./todos');
var profile = require('./profile');
var login = require('./login');
var register = require('./register');
var lost = require('./lost');

//список страниц: creator: класс страницы, restricted: доступ только авторизованным юзерам
var routesList = {
	/* Todos*/
	todos : {
		creator: Todos,
		restricted: true
	},
	/* Profile*/
	profile : {
		creator: profile,
		restricted: true
	},
	/* LoginForm*/
	login : {
		creator: login,
		anonimOnly: true
	},
	/* RegisterForm */
	register : {
		creator: register,
		anonimOnly: true
	},
	/* Page Not Found*/
	lost : {
		creator: lost
	},
}
/**
 Содержит массив страниц приложения

 @class Routes
 @constructor
 @param {Session} session Сессия
 @param {string} current Имя текущей страницы
 */
var Routes = Class({
	'extends': MK.Array,
	constructor: function (session) {
		this
			//песочница это <div id='page-content'>
			.bindNode('container', '#page-content')
			//событие изменения текущей страницы
			.on('change:current', (evt) => {
				console.log('change:routes.current', session.user_id, this.current,evt.attach);

				//если страница задана
				if (this.current) {
					//если в списке есть страница с таким именем
					if (routesList.hasOwnProperty(this.current)) {
						//если анонимы не разрешены отправляем их на страницу входа
						if (!session.user_id && routesList[this.current].restricted) {
							console.log('redirect login');
							this.current = 'login';
						//и наоборот если страница только для анонимов
						} else if (session.user_id && (routesList[this.current].anonimOnly)) {
							console.log('redirect todos');
							this.current = 'todos';
						} else {
							//очищаем все (на самом деле одну) страницы
							this.recreate();
							//создаем страницу, передаем ей сессию и аттачмент

							this.push(new routesList[this.current].creator(session,evt.attach));

						}
					} else {
						//если такой страницы нет
						this.current = 'lost';
					}
				} else {
					//если страница не задана (корень сайта) отправляем на todos
					this.current = 'todos';
				}
			})
			//событие удаления страницы
			.on('removeone', function(evt) {
				//запускаем прописанную в ней функцию очистки (если есть)
				let r = evt.removed;
				if (r.wipeOut) r.wipeOut();
				//и уничтожаем
				r = null;
			});
		//свойство `current` получит значение из url
		this.initRouter('current', 'history');
	}
});

module.exports = Routes;