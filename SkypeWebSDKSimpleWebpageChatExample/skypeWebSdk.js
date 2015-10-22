	var loginSIPAddress = 'onlinewebchat@domain.com';
	var loginDomain = 'domain.com';
	var loginPassword = 'BigSecret';
	var expertSIPAddress = 'sip:expert@domain.com';
	var expertPerson;
	var conversation;
	var convParticipant;
	var inVideoCall = false;
	
	
	var client;
	$(function() {

		'use strict';

		//==========          LOAD SKYPE WEB SDK DYNAMICALLY          ==========
		Skype.initialize({
apiKey: 'SWX-BUILD-SDK',
		}, function(api) {
			$('#ajaxLoading').show();
			client = new api.application();
			console.log("SDK Instantiated");
			SignIn();
		}, function(err) {
			alert('Error loading Skype Web SDK: ' + err);
		});
	});
	
	function GetContactFromName(contactSIP)
	{
		var query = client.personsAndGroupsManager.createPersonSearchQuery();
		query.text(contactSIP);
		query.limit(1);
		return query.getMore();         
	}
	
	//==========          SIGN-IN & PRESENCE STUFF          ==========

	function SignIn() {
		console.log("Signing In");
		// start signing in
		client.signInManager.signIn({
username: loginSIPAddress,
password: loginPassword
		}).then(function() {
			//log in worked!
			SubscribeToExpertPresence();
		}, function(error) {
			//Something went wrong.
			alert(error);
		});
	}

	function SubscribeToExpertPresence() {
		console.log("Subscribing to expert presence");
		GetContactFromName(expertSIPAddress).then(function(results) {
			results.forEach(function(result) {
				expertPerson = result.result;
				expertPerson.status.changed(function(newStatus) {
					ExpertPresenceChanged(newStatus);
				});
				expertPerson.subscribe();
			});
		});
	}

	function ExpertPresenceChanged(newStatus) {
		console.log(newStatus);
		$('#ajaxLoading').hide();
		
		if (inVideoCall) return; //ignore status changes when having a video call with expert.
		
		if (newStatus == 'Online') {
			$('#chat-offline').hide();
			$('#chat-online').show();
		} else {
			$('#chat-offline').show();
			$('#chat-online').hide();
		}
	}
	
	//==========          IM Conversation Stuff          ==========
	
	$("#chat-send").click(function () {
		
		if (typeof conversation == 'undefined') {
			StartNewConversation();
		} else {
			SendMessage();
		}
	});
	
	function StartNewConversation()
	{
		conversation = client.conversationsManager.createConversation();
		convParticipant = conversation.createParticipant(expertPerson);
		conversation.participants.add(convParticipant);
		client.conversationsManager.conversations.add(conversation);
		
		conversation.chatService.state.changed(function (newState)
		{
			if (newState == 'Connected')
			{
				SendMessage();
			}		
		});
		
		conversation.historyService.activityItems.added(function (newMsg) {
			if (newMsg.type() == 'TextMessage')
			{
				var direction;
				if (newMsg.direction() == 'Incoming')
				DisplayIncomingMsg(newMsg.text());			
			}			
		});	
		
		conversation.chatService.start();
	}
	
	function SendMessage()
	{
		var textToSend = $('#chat-input').val();
		if (textToSend !== "") {
			conversation.chatService.sendMessage(textToSend);
			DisplayOutgoingMsg(textToSend)
		}
	}
	
	function DisplayIncomingMsg(newMsg)
	{
		var newItem = "<div class='conversation-recd'><span class='conversation-recd-text'>" + newMsg + "</span></div>";
		$('#conversation').append(newItem);
	}
	
	function DisplayOutgoingMsg(newMsg)
	{
		$('#chat-input').val('');
		var newItem = "<div class='conversation-sent'><span class='conversation-sent-text'>" + newMsg + "</span></div>";
		$('#conversation').append(newItem);
	}
	
	
	//==========          Video Call Stuff          ==========
	$("#video-call").click(function () {
		inVideoCall = true;
		conversation.videoService.start().then(function () {
			conversation.selfParticipant.video.channels(0).stream.source.sink.container(document.getElementById("videoWindowOutgoing"));
			
			convParticipant.video.state.changed(function(state) {
				if (state == 'Connected') 
				{
					convParticipant.video.channels(0).stream.source.sink.container(document.getElementById("videoWindowIncoming"));
					convParticipant.video.channels(0).isStarted.set(true);
				}
			});
			
		});
		
	});
