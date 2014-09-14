// any resemblance with the shared systems code is completely coincidental ;D

var generatePaStatsVetoComputable = function(name) {
	return ko.computed({
		read: function() {
			return name === model.paStatsVetoMap();
		},
		write: function(value) {
			if (value) {
				model.paStatsVetoMap(name);
			} else {
				model.paStatsVetoMap("");
			}
		},
		owner: model
	});
};

(function() {

	//load html dynamically
	function loadHtmlTemplate(element, url, cb) {
	    element.load(url, function () {
	        console.log("Loading html " + url);
	        element.children().each(function() {
				ko.applyBindings(model, this);
				if (cb) {
					cb();
				}
			});
	    });
	}

	model.paStatsVetoMap = ko.observable("").extend({ local: paStatsGlobal.vetoMapName});

	model.paStatsVetoMap.subscribe(function(m) {
		console.log("veto map: " + m);
	});

	var mayOpenPaStatsTab = function() { 
		if (window.location.href.indexOf("pastats=true") !== -1) {
			console.log("open pa stats tab");
			$('#pastatstabclick').click();
		}
	};

	var cnt = 0;

	var h = function() {
		cnt++;
		if (cnt === 3) {
			setTimeout(mayOpenPaStatsTab, 250);
		};
	};
	
	$("#content-tabs").append("<li id='pastats-tab'></li>");
	loadHtmlTemplate($("#pastats-tab"), paStatsBaseDir+"/scenes/ranked_matcher/maps/tab_button.html", h);

	$("#planets").after("<div id='pastatsmaps' class='tab-pane active' data-bind='visible: showPaStatsMaps'>");
	loadHtmlTemplate($("#pastatsmaps"), paStatsBaseDir+"/scenes/ranked_matcher/maps/tab_content.html", h);

	$(".div_commit_cont").append("<div id='pastats-button-bar' data-bind='visible: showPaStatsMaps'></div>");
	loadHtmlTemplate($("#pastats-button-bar"), paStatsBaseDir+"/scenes/ranked_matcher/maps/button_bar.html", h);

	model.showPaStatsSystems = function() {
		model.selectedSystemIndex(-1);
		model.showValue("pastatsmaps");
	};

	model.showPaStatsMaps = ko.computed(function() {
		return model.showValue() === 'pastatsmaps';
	});

	model.loadPaStatsMap = function() {
		var system = pa_stats_mappool[model.selectedSystemIndex()];
		model.loadedSystem(system);
		model.loadedPlanet({});
		model.navForward();
	};

	
}());
