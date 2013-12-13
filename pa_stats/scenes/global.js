//check if we are currently in development mode and determine correct URL to use
var queryUrlBase = undefined;

if(typeof statsDevelopment != 'undefined') {
	queryUrlBase = "http://127.0.0.1:8080/";
} else {
	queryUrlBase = "http://www.nanodesu.info/pastats/";	 
}

var reportVersion = 13;

/*alert.js - javascript alert replacement v2.4 (c) 2009-2011 Naden Badalgogtapeh - http://www.naden.de/blog/javascript-alert*/
window.alertEx=function(){var H=2.4;var D={button_title:"ok",callback:function(){},left:-1,top:-1,width:-1,height:-1,modal:true,timeout:0};if(arguments.length==2&&typeof arguments[1]=="object"){D=J(arguments[1],D)}else{if(arguments.length==3){D=J(arguments[2],D)}}window.alert_callback=D.callback;if(arguments.length==1||(arguments.length==2&&typeof arguments[1]!="string")){arguments=["",arguments[0]]}var A=document.getElementById("alert");if(A){document.body.removeChild(A)}if(D.modal){var F=document.createElement("DIV");F.id="alert-modal";F.className="alert-modal";document.body.appendChild(F)}A=document.createElement("DIV");A.id=A.className="alert";document.body.appendChild(A);A.innerHTML=(arguments[0]==""?"":'<div class="title">'+arguments[0]+"</div>")+'<div class="body">'+arguments[1]+'</div><div class="button"><a href="" onclick="var _m3423=document.getElementById(\'alert-modal\');if(_m3423)document.body.removeChild(_m3423);document.body.removeChild(document.getElementById(\'alert\'));alert_callback();return false;">'+D.button_title+"</a></div>";var B=G(),K=Math.max(I(arguments[0]),I(arguments[1]))*6,C=0,E=0;if(D.width==-1){D.width=K}else{C=D.width;K=0}if(D.left==-1){D.left=parseInt((B[0]+B[2]-K-C)/2)}A.style.display="block";if(D.top==-1){D.top=parseInt(((B[1]+B[3]-(D.height==-1?0:(D.height/2)))/2)-(A.pixelHeight||A.offsetHeight))}A.style.width=D.width+"px";if(D.height>0){A.style.height=D.height+"px"}A.style.left=D.left+"px";A.style.top=D.top+"px";function J(M,L){for(var N in L){if(N in M){continue}M[N]=L[N]}return M}function I(O){var P=O.split("<br />");if(P.length<=1){P=O.split("<br>")}if(P.length<=1){return O.replace(/<(?:.|\s)*?>/g,"").length}var L=0;for(var N=0;N<P.length;N++){var M=P[N].replace(/<(?:.|\s)*?>/g,"");if(M.length>L){L=M.length}}return L}function G(){var M=0,N=0,L=0,O=0;if(typeof window.innerWidth=="number"){M=window.innerWidth;N=window.innerHeight}else{if(document.documentElement&&(document.documentElement.clientWidth||document.documentElement.clientHeight)){M=document.documentElement.clientWidth;N=document.documentElement.clientHeight}else{if(document.body&&(document.body.clientWidth||document.body.clientHeight)){M=document.body.clientWidth;N=document.body.clientHeight}}}if(typeof window.pageYOffset=="number"){O=window.pageYOffset;L=window.pageXOffset}else{if(document.body&&(document.body.scrollLeft||document.body.scrollTop)){O=document.body.scrollTop;L=document.body.scrollLeft}else{if(document.documentElement&&(document.documentElement.scrollLeft||document.documentElement.scrollTop)){O=document.documentElement.scrollTop;L=document.documentElement.scrollLeft}}}return[L,O,M,N]}};

function checkPaStatsVersion() {
	$.get(queryUrlBase + "report/version", function(v) {
		localStorage['pa_stats_req_version'] = v.version;
		if (reportVersion < localStorage['pa_stats_req_version']) {
			alertEx('Outdated PA Stats Version', 'Your version of PA Stats is outdated. ('+reportVersion+'/'+v.version+')<br />Your reports will be silently discarded.<br />Please visit the forums for update instructions or deinstall the mod to get rid of this message!');
		}
	});	
}

function unlockGame(finalCall) {
	var link = sessionStorage['pa_stats_game_link'];
	if (link !== undefined) {
		$.ajax({
			type: "GET",
			url: queryUrlBase + "report/unlock?link="+decode(link),
			complete: function(r) {
				finalCall();
			}
		});
	} else {
		finalCall();
	}
}

function unlockGame_() {
	unlockGame(function(){});
}

var nanodesu = "info.nanodesu.pastats.";
var pa_stats_session_teams = nanodesu+"teams";
var pa_stats_session_team_index = nanodesu+"team_index";