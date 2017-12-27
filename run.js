#!/usr/bin/env nodejs

const Discord = require('discord.js');
const events = require("events");
const fs = require("fs");
const serverSettings = require("./serverSettings");

let handler = require('./handler.js');

/**************/
/*****VARS*****/
/**************/

var client;// = new Discord.Client();
const listener = new events.EventEmitter();

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
	Object.keys(require.cache).forEach(function(key) {
		if(!key.includes("node_modules")) delete require.cache[key];
	});
	handler = require('./handler.js');
	login(true, channelId, messageId);
});

function login(reboot, channelId, messageId){
	client = new Discord.Client();
	client.commands = new Discord.Collection();
	client.Discord = Discord;

	if(__filename == serverSettings.filePath){
		client.login(serverSettings.token); //dupbit
	} else {
		client.login(serverSettings.dev_token); //devbot
	}

	client.on('ready', () => {
	    console.log("\n--" + client.user.username + " connected with ID: " + client.user.id + "\n");
	    handler.setup(client, listener);

		if(reboot){
			client.channels.get(channelId).fetchMessage(messageId).then(message => {message.edit({embed:{color:4193355, description:"Server updated."}})});
		}
	});

	client.on('message', msg => {
		handler.recieveMessage(msg);
	});

}
