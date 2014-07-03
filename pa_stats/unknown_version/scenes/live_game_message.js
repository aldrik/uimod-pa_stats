(function() {
	
	model.isRanked = ko.observable().extend({local: paStatsGlobal.isRankedGameKey});
	model.isNotRanked = ko.computed(function() {
		return !model.isRanked();
	});
	
	model.showDataLive = ko.observable(true).extend({local: paStatsGlobal.showDataLiveKey})
	model.wantsToSend = ko.observable(true).extend({local : paStatsGlobal.wantsToSendKey});
	
	model.liveShouldBeVisible = ko.computed(function() {
		return model.wantsToSend() || model.isRanked();
	});
	
	$(".div_message_display_cont").prepend(
			'<div id="pastatsadds"><div data-bind="visible: isRanked">When playing automatches PA Stats is mandatory for fairness of reporting. However you can select if you want to show live updates.</div><div data-bind="visible: isNotRanked">Send data to PA Stats: <input type="checkbox" data-bind="checked: wantsToSend"/></div>'+
			'<div data-bind="visible: liveShouldBeVisible">Show live updates on the webpage: <input type="checkbox" data-bind="checked: showDataLive"/></div></div>');	
	
}());