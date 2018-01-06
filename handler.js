const https = require('https');
const fs = require('fs');

const Servers = require("./src/server");
const db = require("./src/database");
const ai = require("./src/ai");
const cleverbot = require("./src/cleverbot");
const serverSettings = require("./serverSettings.json");
const blackList = require("./blackList.json");
const antispam = require("./src/antispam");
let bot, Discord, listener, serverManager;


/***************/
/****Exports****/
/***************/

function recieveMessage(msg){
	isCommand(msg, () => {
		antispam.check(Client, msg, () => {
			if(msg.isCommand){
				if(msg.channel.type === "text"){
					// console.log(msg.guild.id, msg.author.id, msg.command);
					db.getSettings(msg.guild.id, "deleteCommands", (value) => {
						if(parseInt(value)){
							msg.delete();
						}
					});
				}
				command(msg);
			}else if(msg.interact){
				if(msg.channel.type === "text"){
					db.getSettings(msg.guild.id, "talk", (value) => {
						if(parseInt(value)){
							db.getSettings(msg.guild.id, "ai", (value) => {
								if(parseInt(value)){
									ai.get(Client, msg);
								} else {
									cleverbot.get(Client, msg);
								}
							});
						}
					});
				} else {
					cleverbot.get(Client, msg);
				}
			}
		});
		console.log(new Date().toISOString() ,msg.author.id, msg.command, msg.params, msg.interact);
	});
	db.setBotStats("messages", 1);
	if(msg.channel.type === "text"){
		db.getStats(msg.guild.id, msg.author.id, (member) => {
			if(member){
				db.setStats(msg.guild.id, msg.author.id, "MSG_SENT", 1);
			}
		});
	}
}

function command(msg){
	let command = bot.commands.get(msg.command);
	if(!command) return;

	if(command.guildOnly && msg.channel.type !== "text"){
		return msg.reply("No no no! Don't use this in DM's :scream:");
	}

	if (command.args && !msg.params.length) {
		let reply = `You are using this command wrong :expressionless:, ${msg.author}!`;

		if (command.usage) {
			reply += `\nTry this: \`${serverManager.prefix}${command.name} ${command.usage}\``;
		} else {
			reply += `\nTry this: \`${serverManager.prefix}${command.name}\``;
		}

		return msg.channel.send(reply);
	}

	try {
		if(!command.guildOnly && msg.channel.type !== "text"){
			try{
				command.execute(Client, msg);
			} catch(e) {
				let message = createEmbed("info", ":bomb: :boom: That didn't work out :neutral_face:");
				send(msg, message);
				console.log(e);
			}
		} else {
			db.getPermissions(msg.guild.id, msg.command, (value) => {
				// console.log("------ " + msg.permissionLevel + "/" + value + " : " + msg.command);
				if (value === undefined || value === 0) return;

				try{
					if(msg.permissionLevel >= value){
						command.execute(Client, msg);
					} else {
						if(command.failPermission !== undefined){
							let message = createEmbed("info", command.failPermission);
							send(msg, message);
						}
					}
				} catch(e){
					let message = createEmbed("info", ":bomb: :boom: That didn't work out :neutral_face:");
					send(msg, message);
					console.log(e);
				}
			});
		}
	}
	catch (error) {
		console.error(error);
		msg.reply(":bomb: :boom: That didn't work out :neutral_face:");
	}
}

function getPrefix(msg, _callback){
	let prefix = serverManager.prefix;
	if(msg.channel.type === "text"){
		db.getSettings(msg.guild.id, "prefix", (pref) => {
			if(pref) prefix = pref;
			_callback(prefix);
		});
	} else {
		_callback(prefix);
	}
}

function isCommand(msg, _callback){
	getPrefix(msg, (prefix) => {
		if(msg.author.id !== bot.user.id && !msg.author.bot && msg.content.slice(0, prefix.length) === prefix){
			msg.params = msg.content.slice(prefix.length).split(" ");
			msg.command = msg.params.shift().toLowerCase();
			msg.isCommand = true;
			if(msg.channel.type === "text"){
				db.getSettings(msg.guild.id, "adminrole", (role) => {
					db.getSettings(msg.guild.id, "support", (support) => {
						if(msg.member == null){
							msg.guild.fetchMember(msg.author.id).then((member) => {
								msg.member = member;
								msg.permissionLevel = serverManager.getPermissionLevel(msg, role, support);
								_callback();
							});
						} else {
							msg.permissionLevel = serverManager.getPermissionLevel(msg, role, support);
							_callback();
						}
					});
				});
			} else {
				_callback();
			}
		} else if(msg.author.id !== bot.user.id && !msg.author.bot ){
			if(msg.content.toLowerCase().includes(msg.client.user.username.toLowerCase())) {
				msg.interact = true;

				let words = msg.content.split(" ");

				let index = words.map(y => y.toLowerCase()).indexOf(msg.client.user.username.toLowerCase());
				if(index === 0 || index === words.length - 1){
					words.splice(index, 1);
				}
				msg.input_ai = words.join(" ");
				if(msg.channel.type === "text"){
					db.getSettings(msg.guild.id, "adminrole", (role) => {
						msg.permissionLevel = serverManager.getPermissionLevel(msg, role);
						_callback();
					});
				} else {
					_callback();
				}

			} else if(msg.channel.type === "dm"){
				msg.interact = true;
				msg.input_ai = msg.content;
				_callback();
			}
		}
	});

}

function setup(b, l){
	console.log("[*]initiating setup");
	bot = b;
	listener = l;
	Discord = b.Discord;

	serverManager = new Servers(b, bot.guilds);

	db.setup(Client, bot.guilds);
	for(key of bot.guilds){
		if(blackList.guilds.includes(key[0])){
			key[1].leave().then( () => {
				console.log("[+]Left guild on blacklist: " + key);
			});
		} else {
			console.log("[*]connected to server: " + key);
		}
	}

	if(bot.token === serverSettings.token){
		serverManager.prefix = serverSettings.prefix;
	} else {
		serverManager.prefix = serverSettings.prefix_dev;
	}

	bot.on("guildCreate", (guild) => {
		if(blackList.guilds.includes(guild.id)){
			key[1].leave().then( () => {
				console.log("[+]Left guild on blacklist: " + key);
			});
		} else {
			db.addGuild(Client, guild.id);
		}
	});

	bot.on("guildMemberRemove", (member) => {
		db.setServerStats(member.guild.id, "guildMemberRemove", member.id);
	});

	bot.on("guildBanAdd", (guild, user) => {
		db.setServerStats(guild.id, "guildBanAdd", user.id);
	});

	bot.on("guildBanRemove", (guild, user) => {
		db.setServerStats(guild.id, "guildBanRemove", user.id);
	});

	bot.on("guildMemberAdd", (member) => {
		db.setServerStats(member.guild.id, "guildMemberAdd", member.id);
		db.getStats(member.guild.id, member.id, (memberx) => {
			if(memberx){
				db.setStats(member.guild.id, member.id, "MSG_SENT", 0);
			}
		});
	});

	addDirToCommands('./src/commands');

	console.log("[+]setup ready");
}

function addDirToCommands(path){
	let files = fs.readdirSync(path);
	for(let file of files){
		if(fs.lstatSync(`${path}/${file}`).isDirectory()){
			addDirToCommands(`${path}/${file}`);
		} else {
			let command = require(`${path}/${file}`);
			bot.commands.set(command.name, command);
		}
	}
}

/**************/
/*****DATA*****/
/**************/

function log(msg, userID, sort, reason, time){
	let mod = msg.author.id;
	let username = userID;
	let presentNick = userID;
	try{
		username = serverManager.getUsername(msg, userID);
		presentNick = serverManager.getNick(msg, userID);
	} catch(e){

	}
	let date = new Date().getTime();
	let message = "";

	if(serverManager.users[msg.guild.id] === undefined){
		serverManager.users[msg.guild.id] = {};
	}

	if(serverManager.users[msg.guild.id][userID] === undefined){
		serverManager.users[msg.guild.id][userID] = {
			id: userID,
			name: username,
			nick: presentNick,
			isBanned: false,
			cooldownTime: 0,
			activeWarnings: 0,
			warnings: {},
			kicks: {},
			bans: {},
			nicks: {},
			unbans: {},
			notes: {}
		}
	}



	let file = serverManager.users[msg.guild.id][userID];
	let title;

	switch(sort){
		case "warn":
			file.warnings[date] = {
				date: date,
				reason: reason,
				mod: mod
			};
			title = "Warning";
			message += "**Mod**: <@" + mod + ">\n**User**: " + username + "\n**Reason**: " + reason;
			break;

		case "kick":
			file.kicks[date] = {
				date: date,
				reason: reason,
				mod: mod
			};
			title = "Kick";
			message += "**Mod**: <@" + mod + ">\n**Kicked**: " + username + "\n**Reason**: " + reason;

			break;

		case "ban":
			file.bans[date] = {
				date: date,
				reason: reason,
				sort: "ban",
				mod: mod
			};
			if(serverManager.users[msg.guild.id].bans === undefined) serverManager.users[msg.guild.id].bans = {};
			serverManager.users[msg.guild.id].bans[userID] = username;
			title = "Ban";
			message += "**Mod**: <@" + mod + ">\n**Banned**: " + username + "\n**Reason**: " + reason;
			break;

		case "tempban":
			file.bans[date] = {
				date: date,
				reason: reason,
				sort: "tempban",
				time: time,
				mod: mod
			};
			title = "tempban";
			message += "**Mod**: <@" + mod + ">\n**Tempbanned**: " + username + "\n**Days**:" + time + "days \n**Reason**: " + reason;
			break;

		case "unban":
			file.unbans[date] = {
				date: date,
				mod: mod
			};
			title = "Unban";
			message += "**Mod**: <@" + mod + ">\n**Unbanned**: " + username;
			delete serverManager.users[msg.guild.id].bans[userID];
			break;

		case "note":
			file.notes[date] = {
				date: date,
				note: reason,
				mod: mod
			};
			title = "Note";
			message += "**Mod**: <@" + mod + ">\n**Note about**: " + presentNick + "\n**Content**: " + reason;
			break;
	}
	message = createEmbed(sort, message, title);

	db.getSettings(msg.guild.id, "logchannel", (channelId) => {
		if(channelId){
			sendChannel(msg, channelId, message);
		}
	});

	if(file.nick !== presentNick){
		file.nicks[date] = {
			date: date,
			nick: presentNick
		};
		file.nick = presentNick;
	}

	serverManager.saveUsers();
}

function dateToString(date){
	return new Date(date).toISOString().replace(/[A-z]/g, " ");
}

function createEmbed(colorName, info, title, fields, footer){
	let color;
	switch(colorName){
		case "info":
			color = 3447003;
			break;

		case "ban":
			color = 16007746;
			break;

		case "kick":
			color = 16028993;
			break;

		case "warn":
			color = 15908236;
			break;

		case "unban":
			color = 4193355;
			break;

		case "succes":
			color = 4193355;
			break;

		case "fail":
			color = 15908236;
			break;

		case "purple":
			color = 0x5a00b1;
			break;

		default:
			color = 3447003;
			break;
	}

	return {
		embed:{
			color: color,
			description: info,
			title: title,
			fields: fields,
			footer: footer
		}
	};
}

function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

function splitter(str, l){
    let strs = [];
    while(str.length > l){
        let pos = str.substring(0, l).lastIndexOf(' ');
        pos = pos <= 0 ? l : pos;
        strs.push(str.substring(0, pos));
        let i = str.indexOf(' ', pos)+1;
        if(i < pos || i > pos+l)
            i = pos;
        str = str.substring(i);
    }
    strs.push(str);
    return strs;
}

function getServerManager(){
	return serverManager;
}

function getListener(){
	return listener;
}

/***************/
/***FUNCTIONS***/
/***************/

function send(msg, message, _callback){
	if(msg.channel.type === "text" && !msg.channel.permissionsFor(msg.client.user).has("SEND_MESSAGES")) return;
	msg.channel.send(message).then((message) => {
		if (typeof _callback === "function"){
			_callback(message);
		}
	});
}

function sendChannel(msg, channelId, message, _callback){
	if(!msg.guild.channels.get(channelId).permissionsFor(msg.client.user).has("SEND_MESSAGES")) return;
	msg.guild.channels.get(channelId).send(message).then((message) => {
		if (typeof _callback === "function"){
			_callback(message);
		}
	});
}

function kick(msg, userID, reason){
	let message = createEmbed("kick", "<@" + userID + "> You have been kicked :wave:");
	send(msg, message);

	if(reason){
		bot.users.get(userID).send(reason);
	} else {
		bot.users.get(userID).send("You have been kicked");
	}

	msg.guild.members.get(userID).kick(reason);
}

function ban(msg, userID, reason){
	let message = createEmbed("ban", "<@"+ userID + "> You have been banned :hammer:");
	send(msg, message);

	bot.users.get(userID).send(reason);

	msg.guild.ban(userID, {
		days: 7,
		reason: reason
	});
}

function unban(msg, userID){
	let message = createEmbed("unban", "Unbanned :ok_hand:");
	send(msg, message);

	msg.guild.unban(userID);
}

function silence(msg, userID){
	let message = createEmbed("warn", "<@" + userID + "> Muted :point_up_2:");
	send(msg, message);

	msg.guild.members.get(userID).setMute(true);
}

function unSilence(msg, userID){
	let message = createEmbed("unban", "<@" + userID + "> Unmuted :ok_hand:");
	send(msg, message);

	msg.guild.members.get(userID).setMute(false);
}

function warn(msg, userID, reason){
	let warnings = {};
	try{
		warnings = serverManager.users[msg.guild.id][userID].warnings;
	} catch(e){}

	db.getSettings(msg.guild.id, "warntime", (value) => {
		let warntime = 24;
		if(value){
			warntime = parseInt(value);
		}
		let today = new Date().getTime();
		let active = 0;
		for (let key in warnings){
			date = warnings[key].date;
			if(today - date < warntime* 60 * 60 * 1000){
				active++;
			}
		}

		let message = createEmbed("warn", reason);

		send(msg, message);

		if (active >= 3){
			let messageKick = createEmbed("kick", "You have been automatically kicked after 3 (active) warnings.");
			kick(msg, userID, messageKick);
			log(msg, userID, "kick", "3 warnings");
		}
	});
}

function see(msg, userID){
	if(!userHasFile(msg, userID)) return;
	let user = serverManager.users[msg.guild.id][msg.author.id];
	let warnings = "";
	let kicks = "";
	let bans = "";
	let unbans = "";
	let nicks = "";

	for(let key in user.warnings){
		warnings += dateToString(user.warnings[key].date) + " - <@" + user.warnings[key].mod + "> - " + user.warnings[key].reason + "\n";
	}
	if(warnings === "") warnings = "-";
	for(let key in user.kicks){
		kicks += dateToString(user.kicks[key].date) + " - <@" + user.kicks[key].mod + "> - " + user.kicks[key].reason + "\n";
	}
	if(kicks === "") kicks = "-";
	for(let key in user.bans){
		bans += dateToString(user.bans[key].date) + " - <@" + user.bans[key].mod + "> - " + user.bans[key].reason + "\n";
	}
	if(bans === "") bans = "-";
	for(let key in user.unbans){
		unbans += dateToString(user.unbans[key].date) + " - <@" + user.unbans[key].mod + "> - " + user.unbans[key].reason + "\n";
	}
	if(unbans === "") unbans = "-";
	for(let key in user.nicks){
		nicks += dateToString(user.nicks[key].date) + " - " + user.nicks[key].nick + "\n";
	}
	if(nicks === "") nicks = "-";

	let fields = [
		{
			name: "Warnings:",
			value: warnings
		},{
			name: "Kicks:",
			value: kicks
		},{
			name: "Bans:",
			value: bans
		},{
			name: "Unbans:",
			value: unbans
		},{
			name: "Previous nicks:",
			value: nicks
		}
	];
	let message = createEmbed("info", "All events related to " + serverManager.getUsername(msg, userID), serverManager.getUsername(msg, userID), fields);
	db.getSettings(msg.guild.id, "logchannel", (channelId) => {
		if(channelId){
			sendChannel(msg, channelId, message)
		} else {
			send(msg, message);
		}
	});
}

function userHasFile(msg, userID){
	if(serverManager.users[msg.guild.id] === undefined) return false;

	let user = serverManager.users[msg.guild.id][userID];

	if(user === undefined){
		let message = createEmbed("info", "User has no file!");
		db.getSettings(msg.guild.id, "logchannel", (channelId) => {
			if(channelId){
				sendChannel(msg, channelId, message);
			} else {
				send(channelId, message);
			}
		});
		return false;
	}
	return true;
}

function deleteMessage(msg, messageID){
	msg.channel.messages.get(messageID).delete();
}

function editMessage(msg, messageID, content){
	msg.channel.messages.get(messageID).edit(content);
}

function addToRole(msg, userID, roleID){
	msg.guild.members.get(userID).addRole(roleID);
}

function removeFromRole(msg, userID, roleID){
	msg.guild.members.get(userID).removeRole(roleID);
}

function joinVoiceChannel(msg, _callback){
	db.getSettings(msg.guild.id, "voiceChannel", (value) => {
		if(value){
			msg.guild.channels.get(value).join().then(con => _callback(con));
		} else {
			msg.member.voiceChannel.join().then(con => _callback(con));
		}
	});
}

function leaveVoiceChannel(msg){
	msg.guild.voiceConnection.channel.leave()
}

/****************/
/****COMMANDS****/
/****************/

module.exports = {
	recieveMessage: recieveMessage,
	setup: setup
};

const Client = {
	music: require("./src/music/music"),
	cah: require("./src/minigames/cahgamehandler"),
	graphs: require("./src/graphs"),

	get bot(){
		return bot;
    },
	get Discord(){
		return Discord;
	},

	command: command,

	serverManager: getServerManager,
	listener: getListener,
	getPrefix: getPrefix,

	createEmbed: createEmbed,
	db: db,

	clean: clean,
	splitter: splitter,
	log: log,

	send: send,
	sendChannel: sendChannel,
	kick: kick,
	ban: ban,
	unban: unban,
	silence: silence,
	unSilence: unSilence,
	warn: warn,
	see: see,
	userHasFile: userHasFile,
	deleteMessage: deleteMessage,
	editMessage: editMessage,
	addToRole: addToRole,
	removeFromRole: removeFromRole,
	joinVoiceChannel: joinVoiceChannel,
	leaveVoiceChannel: leaveVoiceChannel
};
