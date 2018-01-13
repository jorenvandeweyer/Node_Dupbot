const fs = require('fs');

/***************/
/****Exports****/
/***************/

function recieveMessage(msg){
	isCommand(msg).then(() => {
		Client.antispam.check(Client, msg, () => {
			if(msg.isCommand){
				if(msg.channel.type === "text"){
					Client.db.getSettings(msg.guild.id, "deleteCommands").then((value) => {
						if(parseInt(value)){
							msg.delete();
						}
					});
				}
				command(msg);
			}else if(msg.interact){
				if(msg.channel.type === "text"){
					Client.db.getSettings(msg.guild.id, "ai").then((value) => {
						if(parseInt(value) || msg.interactName){
							Client.ai.get(Client, msg);
						}
					});
				} else {
					Client.ai.get(Client, msg);
				}
			}
		});
		console.log(new Date().toISOString() ,msg.author.id, msg.command, msg.params, msg.interact);
	}).catch((error) => {
		//no command
	});
	Client.db.setStats_bot("messages", 1);
	if(msg.channel.type === "text"){
		Client.db.getStats_users(msg.guild.id, msg.author.id).then((member) => {
			if(member){
				Client.db.setStats_users(msg.guild.id, msg.author.id, "MSG_SENT", 1);
			}
		});
	}
}

function setup(bot, listener, Discord){
	console.log("[*]initiating setup");
	Client.bot = bot;
	Client.listener = listener;
	Client.Discord = Discord;

	Client.db.setup(Client);
	Client.events.start(Client);
	Client.discordbots.set(Client);

	for(key of Client.bot.guilds){
		if(Client.blackList.guilds.includes(key[0])){
			key[1].leave().then( () => {
				console.log("[+]Left guild on blacklist: " + key);
			});
		} else {
			console.log("[*]connected to server: " + key);
		}
	}

	if(Client.bot.token === Client.serverSettings.token){
		Client.prefix = Client.serverSettings.prefix;
	} else {
		Client.prefix = Client.serverSettings.prefix_dev;
	}

	Client.bot.on("guildCreate", (guild) => {
		Client.discordbots.set(Client);
		if(Client.blackList.guilds.includes(guild.id)){
			key[1].leave().then( () => {
				console.log("[+]Left guild on blacklist: " + key);
			});
		} else {
			Client.db.addGuild(guild.id);
		}
	});

	Client.bot.on("guildMemberRemove", (member) => {
		Client.db.setServerStats(member.guild.id, "guildMemberRemove", member.id);
	});

	Client.bot.on("guildBanAdd", (guild, user) => {
		Client.db.setServerStats(guild.id, "guildBanAdd", user.id);
	});

	Client.bot.on("guildBanRemove", (guild, user) => {
		Client.db.setServerStats(guild.id, "guildBanRemove", user.id);
	});

	Client.bot.on("guildMemberAdd", (member) => {
		Client.db.setServerStats(member.guild.id, "guildMemberAdd", member.id);
		Client.db.getStats_users(member.guild.id, "all").then((memberx) => {
			if(memberx.length){
				Client.db.setStats_users(member.guild.id, member.id, "MSG_SENT", 0);
			}
		});
	});

	Client.bot.fetchUser(Client.serverSettings.botOwner).then((user) => {
		Client.botOwner = user;
	});

	addDirToCommands('./src/commands');

	console.log("[+]setup ready");
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

	Client.db.setModlog(msg.guild.id, data);

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

	Client.db.getSettings(msg.guild.id, "logchannel").then((channelId) => {
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

/***************/
/***FUNCTIONS***/
/***************/


function command(msg){
	let command = Client.commands.get(msg.command);
	if(!command) return;

	if(command.guildOnly && msg.channel.type !== "text"){
		return msg.reply("No no no! Don't use this in DM's :scream:");
	}

	if (command.args > msg.params.length) {
		let reply = `You are using this command wrong :expressionless:, ${msg.author}!`;

		if (command.usage) {
			reply += `\nTry this: \`${Client.prefix}${command.name} ${command.usage}\``;
		} else {
			reply += `\nTry this: \`${Client.prefix}${command.name}\``;
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
			Client.db.getPermissions(msg.guild.id, msg.command).then((value) => {
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

function isCommand(msg){
	return new Promise((resolve, reject) => {
		getPrefix(msg).then((prefix) => {
			if(msg.author.bot) return reject("Message sent by bot");

			if(msg.content.slice(0, prefix.length) === prefix){
				msg.params = msg.content.slice(prefix.length).split(" ");
				msg.command = msg.params.shift().toLowerCase();
				msg.isCommand = true;
				if(msg.channel.type === "text"){
					Client.db.getSettings(msg.guild.id, "adminrole").then((role) => {
						Client.db.getSettings(msg.guild.id, "support").then((support) => {
							if(msg.member == null){
								msg.guild.fetchMember(msg.author.id).then((member) => {
									msg.member = member;
									msg.permissionLevel = getPermissionLevel(msg, role, support);
									resolve();
								});
							} else {
								msg.permissionLevel = getPermissionLevel(msg, role, support);
								resolve();
							}
						});
					});
				} else {
					resolve();
				}
			} else if(msg.content.toLowerCase().includes(msg.client.user.username.toLowerCase())) {
				if(msg.content.toLowerCase().includes('https://dupbit.com/dupbot')) return reject("url to dupbot");
				msg.interact = true;

				let words = msg.content.split(" ");

				let index = words.map(y => y.toLowerCase()).indexOf(msg.client.user.username.toLowerCase());
				if(index === -1) {
					index = words.map(y => y.toLowerCase()).indexOf(msg.client.user.username.toLowerCase() + ",");
					if(index === 0) msg.interactName = true;
				}
				if(index === 0 || index === words.length - 1){
					words.splice(index, 1);
				}

				msg.input_ai = words.join(" ");
				if(msg.channel.type === "text"){
					Client.db.getSettings(msg.guild.id, "adminrole").then((role) => {
						msg.permissionLevel = getPermissionLevel(msg, role);
						resolve();
					});
				} else {
					resolve();
				}

			} else if(msg.channel.type === "dm"){
				msg.interact = true;
				msg.input_ai = msg.content;
				resolve();
			} else {
				reject("No command");
			}
		});
	});
}

function getPrefix(msg){
	return new Promise((resolve, reject) => {
		let prefix = Client.prefix;
		if(msg.channel.type === "text"){
			Client.db.getSettings(msg.guild.id, "prefix").then((pref) => {
				if(pref) prefix = pref;
				resolve(prefix);
			}).catch(reject);
		} else {
			resolve(prefix);
		}
	});
}

function addDirToCommands(path){
	let files = fs.readdirSync(path);
	for(let file of files){
		if(fs.lstatSync(`${path}/${file}`).isDirectory()){
			addDirToCommands(`${path}/${file}`);
		} else {
			let command = require(`${path}/${file}`);
			Client.commands.set(command.name, command);
		}
	}
}

function getPermissionLevel(msg, adminRole, support){
	if(msg.author.id === Client.serverSettings.botOwner && support == true){
		return 4;
	} else if(msg.channel.type === "dm" || (msg.channel.type === "text" && (msg.member.hasPermission("ADMINISTRATOR") || msg.member.id === msg.guild.ownerID))){
		return 3;
	} else if(msg.member.roles.has(adminRole)){
		return 2;
	} else {
		return 1;
	}
}

function extractID(msg, pos){
	if(msg.mentions.users.first()){
		return msg.mentions.users.first().id;
	} else {
		return msg.params[pos];
	}
}

function extractRoleID(msg, pos){
	if(msg.mentions.roles.first()){
		return msg.mentions.roles.first().id;
	} else if(msg.content.includes("<@&")){
		let id = msg.content.split("<@&")[1].split(">")[0];
		if(msg.guild.roles.has(id)){
			return msg.guild.roles.get(id).id;
		}
	}
	return msg.params[pos];
}

function extractRole(msg, pos){
	if(msg.mentions.roles.first()){
		return msg.mentions.roles.first();
	} else if(msg.content.includes("<@&")){
		let id = msg.content.split("<@&")[1].split(">")[0];
		if(msg.guild.roles.has(id)){
			return msg.guild.roles.get(id);
		}
	}
	return msg.guild.roles.get(msg.params[pos]);
}

function send(msg, message){
	return new Promise((resolve, reject) => {
		if(msg.channel.type === "text" && !msg.channel.permissionsFor(msg.client.user).has("SEND_MESSAGES")) return reject("No SEND_MESSAGES permission");
		msg.channel.send(message).then(resolve, reject);
	});
}

function sendChannel(msg, channelId, message){
	return new Promise((resolve, reject) => {
		if(!msg.guild.channels.get(channelId).permissionsFor(msg.client.user).has("SEND_MESSAGES")) return reject("No SEND_MESSAGES permission");
		msg.guild.channels.get(channelId).send(message).then(resolve, reject);
	});
}

function joinVoiceChannel(msg){
	return new Promise((resolve, reject) => {
		Client.db.getSettings(msg.guild.id, "voiceChannel").then((value) => {
			if(value){
				msg.guild.channels.get(value).join().then(resolve, reject);
			} else {
				msg.member.voiceChannel.join().then(resolve, reject);
			}
		});
	});
}

module.exports = {
	recieveMessage: recieveMessage,
	setup: setup
};

const Client = {
	music: require("./src/music/music"),
	cah: require("./src/minigames/cahgamehandler"),
	graphs: require("./src/graphs"),
	serverSettings: require("./serverSettings.json"),
	events: require("./src/events/events"),
	discordbots: require("./src/discordbots"),
	ai: require("./src/ai"),
	antispam: require("./src/antispam"),
	blackList: require("./blackList.json"),
	db: require("./src/database"),

	commands: new Map(),

	command: command,

	getPrefix: getPrefix,

	createEmbed: createEmbed,

	log: log,
	extractID: extractID,
	extractRoleID: extractRoleID,
	extractRole: extractRole,

	send: send,
	sendChannel: sendChannel,
	joinVoiceChannel: joinVoiceChannel,
};
