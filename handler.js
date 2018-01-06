const https = require('https');
const fs = require('fs');

const Servers = require("./src/server");
const db = require("./src/database");
const ai = require("./src/ai");
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
					db.getSettings(msg.guild.id, "deleteCommands", (value) => {
						if(parseInt(value)){
							msg.delete();
						}
					});
				}
				command(msg);
			}else if(msg.interact){
				if(msg.channel.type === "text"){
					db.getSettings(msg.guild.id, "ai", (value) => {
						if(parseInt(value)){
							ai.get(Client, msg);
						}
					});
				} else {
					ai.get(Client, msg);
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

	if (command.args > msg.params.length) {
		let reply = `You are using this command wrong :expressionless:, ${msg.author}!`;

		if (command.usage) {
			reply += `\nTry this: \`${serverManager.prefix}${command.name} ${command.usage}\``;
		} else {
			reply += `\nTry this: \`${serverManager.prefix}${command.name}\``;
		}

		return msg.channel.send(createEmbed("fail", reply));
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

	serverManager = new Servers(Client);

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

	bot.fetchUser(serverSettings.botOwner).then((user) => {
		bot.botOwner = user;
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

	let data = {
        user: userID,
        type: sort,
        mod: msg.author.id,
        timestamp: Date.now(),
        reason: reason,
        time: time
    };

	db.setModlog(msg.guild.id, data);

	let embed = new Client.Discord.RichEmbed();

	switch(sort){
		case "warn":
			embed.setTitle("Warning");
			embed.setColor(15908236);
			embed.setDescription(`**Mod**: <@${data.mod}>\n**Member:** <@${data.user}>\n**Reason:** ${data.reason}`);
			break;
		case "kick":
			embed.setTitle("Kick");
			embed.setColor(16028993);
			embed.setDescription(`**Mod**: <@${data.mod}>\n**Kicked**: <@${data.user}>\n**Reason**: ${data.reason}`);
			break;
		case "ban":
			embed.setTitle("Ban");
			embed.setColor(16007746);
			embed.setDescription(`**Mod**: <@${data.mod}>\n**Banned**: <@${data.user}>\n**Reason**: ${data.reason}`);
			break;
		case "tempban":
			embed.setTitle("Temp Ban");
			embed.setColor(16007746);
			embed.setDescription(`"**Mod**: <@${data.mod}>\n**Tempbanned**: <@${data.user}>\n**Days**: ${data.time} days\n**Reason**: ${data.reason}`);
			break;
		case "unban":
			embed.setTitle("Unban");
			embed.setColor(4193355);
			embed.setDescription(`**Mod**: <@${data.mod}>\n**Unbanned**: <@${data.user}>`);
			break;
		case "note":
			embed.setTitle("Note");
			embed.setColor("WHITE");
			embed.setDescription(`**Mod**: <@${data.mod}>\n**Note about**: <@${data.user}>\n**Content**: ${data.reason}`);
			break;
	}

	db.getSettings(msg.guild.id, "logchannel", (channelId) => {
		if(channelId){
			sendChannel(msg, channelId, embed);
		}
	});
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

function deleteMessage(msg, messageID){
	msg.channel.messages.get(messageID).delete();
}

function editMessage(msg, messageID, content){
	msg.channel.messages.get(messageID).edit(content);
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
	serverSettings: require("./serverSettings.json"),

	get bot(){
		return bot;
    },
	get Discord(){
		return Discord;
	},
	get serverManager(){
		return serverManager;
	},
	get listener(){
		return listener;
	},

	command: command,

	getPrefix: getPrefix,

	createEmbed: createEmbed,
	db: db,

	clean: clean,
	splitter: splitter,
	log: log,

	send: send,
	sendChannel: sendChannel,
	deleteMessage: deleteMessage,
	editMessage: editMessage,
	joinVoiceChannel: joinVoiceChannel,
	leaveVoiceChannel: leaveVoiceChannel
};
