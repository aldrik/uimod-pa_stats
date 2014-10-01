(function() {
	var channels = "planetaryannihilation";
	
	var keyWidth = 'info.nanodesu.irc.width';
	var keyHeight = 'info.nanodesu.irc.height';
	var keyTop = 'info.nanodesu.irc.top';
	var keyLeft = 'info.nanodesu.irc.left';
	
	if (localStorage[keyWidth] == undefined) {
		localStorage[keyWidth] = encode(800);
		localStorage[keyHeight] = encode(500);
		localStorage[keyTop] = encode(20);
		localStorage[keyLeft] = encode(20);
	}
	
	model.showIRC = ko.observable(false);
	
	model.toggleIRC = function() {
		model.showIRC(!model.showIRC());
	};
	
	var storeSize = function() {
		localStorage[keyWidth] = encode($('#irc-pane').outerWidth());
		localStorage[keyHeight] = encode($('#irc-pane').outerHeight());
	};
	
	var storePosition = function() {
		localStorage[keyTop] = encode($('#irc-pane').position().top);
		localStorage[keyLeft] = encode($('#irc-pane').position().left);		
	};
	
	var tryAddChat = function() {
		var name = decode(sessionStorage['displayName']);

		if (name != null) {
			var iframe = '<iframe id="irc-iframe" src="http://webchat.esper.net/?nick=' + name + '&channels='+ channels + '" position="absolute" width="100%" height="100%"></iframe>';
			$('#irc-pane').append(iframe);

			$("#irc-pane").resizable({
				handles : "all",
				start : function(event, ui) {
					$('iframe').css('pointer-events', 'none');
				},
				stop : function(event, ui) {
					$('iframe').css('pointer-events', 'auto');
					storeSize();
				}

			}).draggable({
				start : function(event, ui) {
					$('iframe').css('pointer-events', 'none');
				},
				stop : function(event, ui) {
					$('iframe').css('pointer-events', 'auto');
					storePosition();
				}
			});
		} else {
			setTimeout(tryAddChat, 1000);
		}
	};
	
	var w = decode(localStorage[keyWidth]);
	var h = decode(localStorage[keyHeight]);
	var t = decode(localStorage[keyTop]);
	var l = decode(localStorage[keyLeft]);
	var button = '<a data-bind="visible: showUberBar() && model.hasJabber(), click: toggleIRC" href="#" class="btn_std" style="position: absolute; z-index: 1000; bottom: 0;width:200px;height: 50px" data-bind="click_sound: \'default\', rollover_sound: \'default\' ">PA Stats IRC</a>';
	var container = '<div data-bind="visible: showIRC" id="irc-pane" style="width: '+w+'px; height: '+h+'px;z-index: 999;position:fixed;top:'+t+'px;left:'+l+'px"></div>';
	$('body').append(button + container);	
	
	tryAddChat();
}());