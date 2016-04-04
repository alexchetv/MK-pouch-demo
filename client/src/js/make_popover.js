var
	$popoverLink = $('[data-popover]'),
	$document = $(document);

function makePopover() {
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

module.exports = makePopover;