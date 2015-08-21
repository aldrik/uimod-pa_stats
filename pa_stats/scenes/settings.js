(function() {
	function PaStatsSettingsModel() {
		var self = this;
		var oldWantsToSend = ko.observable();
		var oldShowDataLive = ko.observable();
		var oldChatDisabled = ko.observable();
		var oldUseAjaxubernet = ko.observable();
		
		self.reloadCleanState = function() {
			oldWantsToSend(decode(localStorage[paStatsGlobal.wantsToSendKey]));
			oldShowDataLive(decode(localStorage[paStatsGlobal.showDataLiveKey]));
			oldChatDisabled(decode(localStorage["info.nanodesu.pachat.disablechat"]));
			oldUseAjaxubernet(decode(localStorage['info.nanodesu.pastats.use_ajax_ubernet']));
		};
		
		self.reloadCleanState();
		
		self.wantsToSend = ko.observable(oldWantsToSend());
		self.showDataLive = ko.observable(oldShowDataLive());
		self.disableChat = ko.observable(oldChatDisabled());
		self.ajaxUbernet = ko.observable(oldUseAjaxubernet());
		
		self.dirty = ko.computed(function() {
			return self.wantsToSend() !== oldWantsToSend() ||
				self.showDataLive() !== oldShowDataLive() ||
				self.disableChat() !== oldChatDisabled() ||
				self.ajaxUbernet() !== oldUseAjaxubernet();
		});
	}

	var paStatsSettingsModel = new PaStatsSettingsModel();

	model.paStatsSettingsModel = paStatsSettingsModel;
	
	var oldClean = model.clean;
	model.clean = ko.computed(function() {
		return oldClean() && !model.paStatsSettingsModel.dirty();
	});
	
	var doStore = function() {
		paStatsOldOk();
		localStorage[paStatsGlobal.wantsToSendKey] = encode(paStatsSettingsModel.wantsToSend());
		localStorage[paStatsGlobal.showDataLiveKey] = encode(paStatsSettingsModel.showDataLive());
		localStorage["info.nanodesu.pachat.disablechat"] = encode(paStatsSettingsModel.disableChat());
		localStorage['info.nanodesu.pastats.use_ajax_ubernet'] = encode(paStatsSettingsModel.ajaxUbernet());
		paStatsSettingsModel.reloadCleanState();
	};
	
	var paStatsOldOk = model.save;
	model.save = function() {
		doStore();
		return paStatsOldOk();
	};
	
	var paStatsOldOkClose = model.saveAndExit;
	model.saveAndExit = function() {
		paStatsOldOkClose();
		doStore();
	};
	
	var paStatsOldDefaults = model.restoreDefaults;
	model.restoreDefaults = function() {
		paStatsOldDefaults();
		paStatsSettingsModel.wantsToSend(true);
		paStatsSettingsModel.showDataLive(true);
		paStatsSettingsModel.disableChat(false);
		paStatsSettingsModel.ajaxUbernet(false);
	};
	
	model.settingGroups().push("pastats");
    model.settingDefinitions()["pastats"] = {title:"PA Stats",settings:{}};
    $(".option-list.ui .form-group").append('<div class="sub-group pastatssettings">');
    
    $(".option-list.keyboard").parent().append('<div class="option-list pastats" '+
    		'data-bind="visible:($root.settingGroups()[$root.activeSettingsGroupIndex()] === \'pastats\'), '+
    		'with: model.paStatsSettingsModel" style="display: none;">');
    
	$(".option-list.pastats").load(paStatsBaseDir+"scenes/settings.html", function () {
		var targetElement = $('#pasttatssettingspanel').get(0);
		ko.cleanNode(targetElement); // this seems not even to be strictly required, but better safe than sorry
		ko.applyBindings(paStatsSettingsModel, targetElement);
		console.log("pa stats settings tab injected");
		model.settingGroups.notifySubscribers();
	});
}());