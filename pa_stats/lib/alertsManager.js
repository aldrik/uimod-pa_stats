var alertsManager =
	(typeof alertsManager === 'undefined') ? 
	(function(){
			// currently this internally asks for all created and destroyed events
		    // this may change in the future
		
			// damage alerts trigger whenever health changes, even when it goes up.
		  	// so this is kind of useless, thus no support for them is implemented
		  	// that means: only the commander damage alert will trigger by default
		  	// I am also concerned about the amount of damaged alerts that could be triggered
		  	// if you want to try them just uncomment them, all other code will be able to handle them if you use the right watch_type
		  	var _hookIntoAlerts = ['watchlist.setCreationAlertTypes', 'watchlist.setDeathAlertTypes'/*, 'watchlist.setDamageAlertTypes'*/];
		  	var _allAlertsTypes = ['Mobile', 'Structure'];

			var _watchTypes = {
				CREATED: 0,
				DAMAGED: 1,
				DESTROYED: 2
			};
			
			var _makeEmptyFilterSettings = function() {
				return {selectedTypes: {}, includedUnits: {}, excludedUnits: {}};
			}
			
			var _defaultFilterSettings = _makeEmptyFilterSettings();
			_defaultFilterSettings.selectedTypes[_watchTypes.CREATED] = ['Factory'];
			_defaultFilterSettings.selectedTypes[_watchTypes.DAMAGED] = ['Commander'];
			_defaultFilterSettings.selectedTypes[_watchTypes.DESTROYED] = ['Structure'];
			// includedUnits and excludedUnits are not used by the default settings
			
			var _listenerCounter = 0;
			var _listeners = {};
			var _watchListHandler = function(payload) {
				for (listener in _listeners) {
					if (_listeners.hasOwnProperty(listener)) {
						var copy = {};
						$.extend(true, copy, payload);
						_listeners[listener](copy);
					}
				}
			};
			
			var _addListener = function(listener) {
				_listenerCounter += 1;
				var cnt = _listenerCounter;
				_listeners[cnt] = listener;
				return function() {
					delete _listeners[cnt];
				};
			};
			
			var _unitSpecMapping = undefined;
			unitInfoParser.loadUnitTypeMapping(function(mapping) {
				_unitSpecMapping = mapping;
			});
			
			// make a filter function by the given settings object
			// the settings object should have the following properties:
			// selectedTypes, includedUnits, excludedUnits
			// each of these should have a property with the watch_type key (see the enums at the top of the file)
			// this property should be an array with either the type or the unit spec-id
			// if there is no mapping for a watch type it will not be filtered at all
			var _makeFilterBy = function(settings) {
				return function(payload) {
					var selectedTypes = settings.selectedTypes;
					var includedUnits = settings.includedUnits;
					var excludedUnits = settings.excludedUnits;

					function contains(ar, val) {
						return ar !== undefined && $.inArray(val, ar) !== -1;
					}
					
					function shouldBeRetained(notice) {
						var checkTypes = selectedTypes[notice.watch_type];
						var includeSpecs = includedUnits[notice.watch_type];
						var excludeSpecs = excludedUnits[notice.watch_type];
						
						if (contains(includeSpecs, notice.spec_id)) {
							return true;
						} else if (contains(excludeSpecs, notice.spec_id)) {
							return false;
						} else {
							for (var i = 0; i < checkTypes.length; i++) {
								if (contains(_unitSpecMapping[notice.spec_id], checkTypes[i])) {
									return true;
								}
							}
							return false; // nothing matched
						}
					}
					payload.list = payload.list.filter(shouldBeRetained);
					return payload;
				};
			};
			
			var _addFilteredListener = function(listener, filterSettings) {
				var filter = _makeFilterBy(filterSettings);
				var actualListener = function(payload) {
					var filtered = filter(payload);
					if (filtered.list.length > 0) {
						listener(filtered);
					}
				};
				return _addListener(actualListener);
			};
			
			var _displayHandler = undefined;
			var _removeDisplayListener = undefined;
			
			var _initHook = function() {
				var oldApplyUiStuff = model.applyUIDisplaySettings;
				model.applyUIDisplaySettings = function() {
				  function listenToAllAlerts() {
					 for (var i = 0; i < _hookIntoAlerts.length; i++) {
						engine.call(_hookIntoAlerts[i], JSON.stringify(_allAlertsTypes), JSON.stringify([])); // I am assuming the 2nd on is an exclusion, tests need to validate it. If yes it should be used, too
					 }
				   }
				   listenToAllAlerts();
				   // to get rid of wrong settings by rAlertsFilter
				   window.setTimeout(listenToAllAlerts, 3000);
				   // this basically is a race condition vs rAlertsFilter, so better save than sorry
				   window.setTimeout(listenToAllAlerts, 5000);
				   
				   oldApplyUiStuff();
				};
				
				_displayHandler = handlers.watch_list;
				_removeDisplayListener = _addFilteredListener(_displayHandler, _defaultFilterSettings);
				handlers.watch_list = function(payload) {
					_watchListHandler(payload);
				};
			};
			
			var _getDisplayListener = function() {
				return _displayHandler;
			};
			
			var _replaceDisplayFilter = function(settings) {
				_removeDisplayListener();
				_removeDisplayListener = _addFilteredListener(_displayHandler, settings);
			};
			
			_initHook();
			
			return {
				// add a listener method to the alertsManager
				// this add method returns a function that, when called, removes the added listener from the manager
				// expects a settings to filter for types with specific unit inclusions and exclusions
				addFilteredListener: _addFilteredListener,
				// add a listener that listens for all events.
				// this is the same as calling addFilteredListener with filter settings that accept the types Mobile and Structure for all alerts
				addListener: function(listener) {
					var settings = _makeEmptyFilterSettings();
					for (typ in _watchTypes) {
						if (_watchTypes.hasOwnProperty(typ)) {
							settings.selectedTypes[_watchTypes[typ]] = _allAlertsTypes;
						}
					}
					_addFilteredListener(listener, settings);
				},
				// return the orginal handler of the watch_list even in PA
				getDisplayListener: _getDisplayListener,
				// creates a filter from settings
				makeDisplayFilterForSettings: _makeFilterBy,
				makeEmptyFilterSettings: _makeEmptyFilterSettings,
				// pass an object with filter settings to use a default filter for types/unit inclusions/exclusions
				replaceDisplayFilter: _replaceDisplayFilter,
				// "constants" you can use instead of magic numbers
				WATCH_TYPES: _watchTypes
			};
		}()) : alertsManager;