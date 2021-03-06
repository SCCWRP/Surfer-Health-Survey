var appRouter = new (Backbone.Router.extend({
  routes: {
    "shs/receipt/:appid": "receipt",
    "shs/": "start",
    "": "start"
  },
  checksum: function(){
	console.log("checksum");
  	//if (networkStatus != 'offline' && isDevice == true){
  	if (networkStatus != 'offline'){
		var surveyKey = window.localStorage.getItem("http://data.sccwrp.org/shs/index.php/surveys");
		var splitKey = surveyKey.split(',');
		var splitKeyCount = splitKey.length;
		console.log(splitKeyCount);
		for(var i=0; i<splitKeyCount; i++){
			console.log(splitKey[i]);
			// check each value against server - to confirm they are "complete" in status field
			// if not - send to staging table for manual decision making
		}
	}
  },
  css: function(){
	     console.log("css");
	     $('#one').trigger('pagecreate');
	     $('html,body').animate({ scrollTop: '0px'}, 0);
	     appRouter.resizePage();
	    if(deviceType == "iPhone"){
			$('.ui-title').css('font-size','18px');
			$('#multi-view .ui-btn-text').css('font-size','18px');
			$('#multi-view').css('margin-left','15%');
			$('#multi-select').css('margin-left','5%');
			$('#multi-select h3').css('font-size','18px');
			$('#multi-select select').css('font-size','18px');
	    }
	    //$(window).scroll(appRouter.positionFooter).resize(appRouter.positionFooter); - issues with iphone
  },
  gift: function(giftid){
	//console.log("gift");
	var gift = new Gift({id: giftid});
	 /* gift will require its own view to create a temporary sticky popup on footer bar */
	 gift.fetch({success: setMessage,error: errorMessage});
	 function setMessage(response){
		 console.log("gift");
		 console.log(response.attributes.user_visits);
		 if(response.attributes.user_visits){
		 	var message = "You have completed "+ response.attributes.user_visits + " follow-up surveys. When you reach " + response.attributes.gift_visits + " you will receive a "+ response.attributes.gift +"";
			console.log(message);
		 	$("#popupTip").trigger("create");
		 	$("#popupTip").popup("open");
		 	$("#popupTip").html(message);
		 	//$("#popupTip").html(message).enhanceWithin().popup("refresh");  
		 	//$("#popupTip").append('<a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Close</a>');
		 	setTimeout(function(){ $("#popupTip").popup("close"); },7000);
		 }
		 /*
		 $("#popupClose").click(function(){
			 $("#popupInfo").popup("close");
		 });
		 */
		 //console.log(response);
	 }
	 function errorMessage(response){
		 console.log(response);
	 }
  },	
  history: function(historyid){
	var that = this;
	var history = new History({id: historyid});
	/* for some reason the code below in setMessage when applied to render historyView wont work - maybe history is special word -- need to put click event for each li into view */
	history.fetch({success: setMessage,error: errorMessage});
	 function setMessage(response){
		 /* not a great workaround - history has a default attribute of id - needs to be ignored */
		 console.log(history.keys(history.Data).length);
		 if(history.keys(history.Data).length <=  1) {
			appRouter.gift(historyid);
			appRouter.weekly();
			return;	
		 };
		 //historyView = new HistoryView({model: history}); 
		 //historyView.render();
		 $("#content").html( new HistoryView({model: history}).render().el );
		 $('#content').trigger('create');

	 }
	 function errorMessage(response){
		 console.log(response);
	 }
  },
  question: function(){
	questionList = new QuestionList();
        questionList.fetch({ success: function(response){ console.log("questionList fetch - success"); questionList.getQuestion(); } });
  },
  positionFooter: function(){
	console.log("positionFooter");
	$footer = $("#footer");
	footerHeight = $footer.height();
	var deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";
	if (deviceType != "iPhone") { 
		$('#footer').css('visibility','visible');
		$('#footer').css('font-size','10px');
	}
	var drop = (deviceType == "iPhone") ? /*-59*/3:3;
	//console.log("window scrolltop: "+ $(window).scrollTop());
	//console.log("window height: "+ $(window).height());
	//footerTop = ($(window).scrollTop()+$(window).height()-footerHeight)-drop+"px";       
	$footer.css({
		position: "fixed",
		bottom: 0,
		left:0,
		right:0
	});
  },
  receipt: function(appid){
	 console.log("receipt");
	 var receipt = new Receipt({id: appid});
	 //receiptView = new ReceiptView({model: receipt});
	// $("#content").html( new ReceiptView({model: response}).render().el );
	 receipt.fetch({success: successMessage,error: errorMessage});
	 function successMessage(response){
		 console.log("receipt success");
		 //console.log(response);
		 console.log(receipt);
		 //$("#content").html( new ReceiptView({model: response}).render().el );
		 $("#content").html( new ReceiptView({model: receipt}).render().el );
		 $('#content').trigger('create');
	 }
	 function errorMessage(response){
		 console.log("receipt fail");
		 console.log(response);
	 }
  },
  resizePage2: function(formName){
	       console.log("resizePage2");
	       var multiBottom = $('#'+formName).offset().top+$('#'+formName).height();
	       var viewBottom = $('#one').height()-$('#footer').height();
	       	var minHeight = "" + (multiBottom + 400) + "px";
		var oneHeight = (multiBottom > viewBottom) ? minHeight:("" + $('body').height() + "px");
		if(formName == 'text-btn'){
			$('#one').css('height',1024);
		} else {
			$('#one').css('height',oneHeight);
		}
  },
  resizePage: function(){
	/* in the beta version this functin was used with unique form element names
	   in full study all (maybe) form elements derive from .ui-field-contain */
/* this isnt perfect but seems to work - going to need more work to get exact */ 
	// total size of form element and amount of space from top
	var formSize = Math.round($('#content').offset().top+$('#content').height());
	//var formSize = Math.round($('.ui-field-contain').offset().top+$('.ui-field-contain').height());
	console.log("formSize: "+ formSize);
	// size of page minus footer - changed from one to content for full study
	var stageSize = Math.round($('#one').height()-$('#footer').height());
	console.log("stageSize: "+ stageSize);
	// total size of form element with some padding
	var minHeight = "" + (formSize + 400) + "px";
	console.log("minHeight: "+ minHeight);
	// get consent if set
	//var consentSize = Math.round($('#consent').height());
	//console.log("consentSize: "+consentSize);
	// current size of entire page
	var oneHeight = (formSize > stageSize) ? minHeight:("" + Math.round($('#one').height()) + "px");
	console.log("multi-select: "+ $('#multi-select').height());
	if($('#consent').height() == 0){
		console.log("consent");
		console.log("consent: "+$('#consent').height());
		$('#one').css('height',6000);
		console.log("one: "+$('#one').height());
	} else {
		$('#one').css('height',oneHeight);
	}
	if($('#multi-select').height()){
		var multiHeight = ($('#multi-select').height()+500+"px");
		$('#one').css('height',multiHeight);
	}
	if($('#multi-view').height()){
		var multiHeight = ($('#multi-view').height()+500+"px");
		$('#one').css('height',multiHeight);
	}
	console.log("oneHeight: "+oneHeight);
  },
  signup: function(){
	console.log("signup");
	// create initial record in database - set timestamp
	questionList = new QuestionList();
	questionList.fetch({
	  success: function(response){
		console.log("questionList fetch - success");
	  }
	});
	user = new User();
	var seedEmail = chance.email();
	var seedPhone = chance.phone();
	var userCreate = user.save({email: seedEmail, phone: seedPhone, visits: 0}, {
	  	wait: true,
	      	success: function(response){
			console.log("user - success");
	  		//console.log(response.toJSON());
			USERID = response.id;
			startSignup(seedEmail,seedPhone);
		  },
		error: function(model,response){
	       		console.log("failed");
			console.log(response.responseText);
			console.log(response.status);
			console.log(response.statusText);
		}
	});
	function startSignup(seedEmail,seedPhone){
	  answerList = new AnswerList();
	  var answerCreate = answerList.create({q6: seedPhone, q7: seedPhone, q8: seedEmail, q9: seedEmail, qcount: 1, timestamp: SESSIONID, survey_type: "enrollment"}, {
	    success: function(response){
		console.log("start - success");
		var answer = answerList.get(response.id);
		answerListView = new AnswerListView({model: answer });
		answerListView.endquestion = MAXQUESTION;
	    },
 	    error: function(model, response){
		console.log("failed");
		console.log(response.responseText);
		console.log(response.status);
		console.log(response.statusText);
	    }
	  });
	}
  },
  weekly: function(){
	console.log("weekly");
	// user has logged in successfully lets check to see if they have an stored sessions
  	//if (networkStatus != 'offline' && isDevice == true){
	// this should probably get moved to LoginView
  	if (networkStatus != 'offline'){
		var dirtyKey = window.localStorage.getItem("http://data.sccwrp.org/shs/index.php/surveys_dirty");
		if (dirtyKey){
			console.log("dirtyKey: "+dirtyKey);
			//submitLocal(dirtyKey); -- need to fix submission through history
			startWeekly();
		} else {
			startWeekly();
		}
	} else {
		startWeekly();
	}
	function submitLocal(dirtyKey){
		// split on comma to get individual keys
		// sync data
		var splitKey = dirtyKey.split(',');
		var splitKeyCount = splitKey.length;
		for(var i=0; i<splitKeyCount; i++){
			var surveyLocalKey = window.localStorage.getItem("http://data.sccwrp.org/shs/index.php/surveys"+ splitKey[i]);
			//storeLocal(localKey,localReceipt);
			var surveyLocalObject = jQuery.parseJSON(surveyLocalKey);
			var saveList = new AnswerList();
			saveList.create(surveyLocalObject, {
		  	  wait: true,
  		  	  success: function(model,response){
				appID = Number(response.id);
				console.log(appID);
				console.log("Receipt: "+ saveList.toJSON());
				// future - need to setup receipt for each local submission
				//appRouter.navigate('shs2/receipt/' + appID, {trigger: true});
  		  	  },
		  	  error: function(response){
				console.log("failed");
				console.log(response.responseText);
				console.log(response.status);
				console.log(response.statusText);
  		  	  }
			});
		} // end for
	} // close submitLocal
	function startWeekly(){
			console.log("startWeekly");
			answerList = new AnswerList();
			//this.answerList = answerList;
			answerList.create({qcount: 25, user_id: USERID, timestamp: SESSIONID, survey_type: "followup"}, {
	  		  wait: true,
	  		  success: function(model,response){
				answer = answerList.get(response.id);
				answerListView = new AnswerListView({model: answer});
				answerListView.endquestion = 70;
	  		  },
 			  error: function(model,response){
				if(response.status == 500){
					console.log(response.responseText);
					console.log(response.status);
					console.log("failed");
					//app.dialog("Failed to Start Weekly","Application Reload","Ok");
					alert("Failed to Start Weekly");
					location.reload();
				}
			  }
			});
	}
  },
  start: function(){
	console.log("start");
	//app.dialog("start","start title","Ok");
	//appRouter.navigate('shs2/receipt/1031', {trigger: true});
	//appRouter.checksum();
	//introView.render();
	$("#content").html( new IntroView().render().el );
	//$("#content").trigger("create");
	//$("#landing").trigger("create");
	// not sure whether this is the best place to load the questions collection
	appRouter.question();
        //$(window).scroll(appRouter.positionFooter).resize(appRouter.positionFooter);  - temporary
  }
}));
var app = {
  dialog: function(message,title,button){
	function dialogCallback(){
		//alert("dialogCallback closed");
	}
	if(isDevice == true){
		navigator.notification.alert(message, dialogCallback, title, button)	
	} else {
		alert(message);
	}
  },
  xhr_get: function(url,indata){
	return $.ajax({
		type: 'GET',
		url: url,
		contentType: "application/json",
		dataType: 'jsonp',
		data: {generic: indata},
		crossDomain: true
		//beforeSend: loader
	})
	.always(function(){
		// loader
	})
	.fail(function(){
		// failures
	});
  },
  notify: function(e,i){
	console.log(e);
	console.log(i);
	var url = 'http://data.sccwrp.org/shs2/email.php';
	//var p = "15625727718";
	var message = $.ajax({
		type: 'GET',
		url: url,
		contentType: "application/json",
		dataType: 'jsonp',
		data: {ee: e,ii: i},
		crossDomain: true,
		timeout: 4000,
		error: function(data){ 
			 console.log(data);
			 //if(t==="timeout"){ alert("Data not Submitted"); }
		}, 
		success: function(data) {
			console.log(data);
			//alert("status:"+data.status[0]);
			//alert("number:"+data.number[0]);
			//lookup_number = data.number[0];
		},
		complete: function(data) {
			//alert("complete:"+data.key);
	        }
    	});

  },
  onDeviceReady: function(){
 	// jquery cors support for phonegap - ie9
	/*
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
	*/
	// disable jquery mobile routing
	$.mobile.ajaxEnabled = false;
	$.mobile.linkBindingEnabled = false;
	$.mobile.hashListeningEnabled = false;
	$.mobile.pushStateEnabled = false;
  	Backbone.history.start({pushState: true, hashChange: false});
	// check network status
 	networkStatus = navigator.onLine ? 'online' : 'offline';
	FastClick.attach(document.body);
	appRouter.start();
  },
  initialize: function(){
	if(document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1){
		isDevice = true;
	}
	if( isDevice ){
    		document.addEventListener("deviceready", function(){
			app.onDeviceReady();
		},true);
	} else {
		app.onDeviceReady();
	}
  }
};
app.initialize();
