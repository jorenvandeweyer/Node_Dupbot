#!/usr/bin/env nodejs

const Discord = require('discord.js');
const handler = require('./handler.js');
const events = require("events");
const fs = require("fs");

/**************/
/*****VARS*****/
/**************/

var client;// = new Discord.Client();
const listener = new events.EventEmitter();
const serverSettings = JSON.parse(fs.readFileSync('serverSettings.json', 'utf8'));

/***************/
/***Listeners***/
/***************/
login();

listener.on("reload", function(){
	let channelId = client.user.lastMessage.channel.id;
	let messageId = client.user.lastMessage.id;
	client.destroy();
	console.log("\n[*]reloading files\n");
	delete require.cache[require.resolve('./handler.js')];
	handler = require('./handler.js');
	login(true, channelId, messageId);
});

function login(reboot, channelId, messageId){
	client = new Discord.Client();
	if(__filename == serverSettings.filePath){
		client.login(serverSettings.token); //dupbit
	} else {
		client.login(serverSettings.dev_token); //devbot
	}

	client.on('ready', () => {
	    console.log("\n--" + client.user.username + " connected with ID: " + client.user.id + "\n");
	    handler.setup(client, listener, serverSettings);

		if(reboot){
			client.channels.get(channelId).fetchMessage(messageId).then(message => {message.edit({embed:{color:4193355, description:"Server updated."}})});
		}
	});

	client.on('message', msg => {
		handler.recieveMessage(msg);
	});

}
