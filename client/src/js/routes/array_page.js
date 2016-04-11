var Page = Class({
	'extends': MK.Array,
	title:'Matreska Demo',
	setTitle: function (addition) {
		setTimeout(()=>{
			console.log('debounce');
			document.title = this.title + (addition ? ' - '+ addition : '');
		}, 100);
	}
});

module.exports = Page;
