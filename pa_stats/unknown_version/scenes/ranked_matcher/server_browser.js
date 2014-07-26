// This code is a mess. It's temporary. I hope Uber releases a proper ladder before I have to clean this up.
// gamma broke it, I hacked it to "work" again. This is somehow rather ugly...
$('.section_controls').append('<a href="#" class="btn_std" style="width: 100%" data-bind="click_sound: \'default\', rollover_sound: \'default\' ">'+
		'<div class="btn_label">'+
		'    NO AUTOMATCHES IN UNKNOWN BUILDS'+
		'</div>'+
		'<div style="margin-top: 8px; margin-right: 10px; font-size: 12px; float: right; display: none" id="pa_stats_players_note">You or somebody else<br/>is searching!</div>'+		
		'</a>');
